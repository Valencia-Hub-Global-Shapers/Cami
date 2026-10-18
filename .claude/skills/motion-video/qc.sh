#!/bin/sh
# Final-pass checks for a rendered video, plus a frame sheet to look at.
#
#   qc.sh <video.mp4> <WxH> <fps> <seconds> [lufs=-14] [true_peak=-1]
#
# Checks: size, fps, pixel format (yuv420p), duration (within 5%), black
# frames mid-video, frozen stretches (reported, often designed reading holds),
# integrated loudness (within 1 LU), true peak. Writes <video>-sheet.png next
# to the video (about one frame per second of the first 60). Exits 1 on FAIL.
set -u
v=$1 size=$2 fps=$3 want=$4 lufs=${5:--14} tp=${6:--1}
fail=0
pass() { printf 'PASS  %-10s %s\n' "$1" "$2"; }
bad() { printf 'FAIL  %-10s %s\n' "$1" "$2"; fail=1; }
note() { printf 'NOTE  %-10s %s\n' "$1" "$2"; }

probe() {
    ffprobe -v error -select_streams v:0 -show_entries "stream=$1" \
        -of default=nw=1:nk=1 "$v"
}
got_size="$(probe width)x$(probe height)"
[ "$got_size" = "$size" ] && pass size "$got_size" || bad size "$got_size (want $size)"

rate=$(probe r_frame_rate)
got_fps=$(echo "$rate" | awk -F/ '{printf "%.2f", $1 / $2}')
awk -v a="$got_fps" -v b="$fps" 'BEGIN{exit !(a - b < 0.01 && b - a < 0.01)}' \
    && pass fps "$got_fps" || bad fps "$got_fps (want $fps)"

pix=$(probe pix_fmt)
[ "$pix" = "yuv420p" ] && pass pixel "$pix" \
    || bad pixel "$pix (re-encode with -pix_fmt yuv420p, plays everywhere)"

dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$v")
awk -v d="$dur" -v w="$want" 'BEGIN{exit !(d > w * 0.95 && d < w * 1.05)}' \
    && pass duration "${dur}s" || bad duration "${dur}s (want ${want}s +-5%)"

black=$(ffmpeg -hide_banner -nostats -i "$v" -vf blackdetect=d=0.3:pix_th=0.08 \
    -an -f null - 2>&1 | grep -o 'black_start:[0-9.]*' | cut -d: -f2 \
    | awk -v d="$dur" '$1 > 0.5 && $1 < d - 1.5' | tr '\n' ' ')
[ -z "$black" ] && pass black "none mid-video" || bad black "starts at: $black"

frozen=$(ffmpeg -hide_banner -nostats -i "$v" -vf freezedetect=n=0.001:d=2 \
    -an -f null - 2>&1 | grep -o 'freeze_start: [0-9.]*' | cut -d' ' -f2 \
    | tr '\n' ' ')
[ -z "$frozen" ] && pass frozen "none" \
    || note frozen "holds from: $frozen(fine if they are designed reading holds)"

loud=$(ffmpeg -hide_banner -nostats -i "$v" -af loudnorm=print_format=summary \
    -vn -f null - 2>&1)
i=$(echo "$loud" | awk '/Input Integrated/ {print $3}')
p=$(echo "$loud" | awk '/Input True Peak/ {print $4}')
awk -v a="$i" -v b="$lufs" 'BEGIN{exit !(a - b <= 1 && b - a <= 1)}' \
    && pass loudness "$i LUFS" || bad loudness "$i LUFS (want $lufs +-1)"
awk -v a="$p" -v b="$tp" 'BEGIN{exit !(a <= b)}' \
    && pass truepeak "$p dBTP" || bad truepeak "$p dBTP (want <= $tp)"

sheet="${v%.*}-sheet.png"
step=$(awk -v d="$dur" 'BEGIN{s = d / 60; print (s < 1 ? 1 : s)}')
ffmpeg -y -loglevel error -i "$v" \
    -vf "fps=1/$step,scale=320:-1,tile=6x10:padding=4:color=black" \
    -frames:v 1 "$sheet" && pass sheet "$sheet (look at it)"

[ $fail -eq 0 ] && echo "ALL PASS" || echo "FAIL"
exit $fail
