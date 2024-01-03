# Example text-to-video mapping
text_to_video_map = {
    "Explain photosynthesis": "videos/photosynthesis.mp4",
    "Introduction to calculus": "videos/calculus_intro.mp4",
    "The water cycle": "videos/water_cycle.mp4"
}


# Function to retrieve the video file for a given text
def get_video_for_text(text):
    return text_to_video_map.get(text, "videos/default.mp4")
# Provide a default video


# Example usage
text = "Explain photosynthesis"
video_path = get_video_for_text(text)
print(f"Video path for '{text}': {video_path}")
