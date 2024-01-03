from moviepy.editor import VideoFileClip, concatenate_videoclips

# Load video clips
video_clip1 = VideoFileClip("video1.mp4")
video_clip2 = VideoFileClip("video2.mp4")

# Concatenate video clips
final_video = concatenate_videoclips([video_clip1, video_clip2])

# Save the final video
final_video.write_videofile("output_video.mp4")
