# -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" `

ls .\public\samples\src\ | % {
  ffmpeg.exe -n -i $_ `
    -profile:v baseline `
    -pix_fmt yuv420p `
    -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" `
    ".\public\samples\hd\$($_.BaseName).mp4"
}