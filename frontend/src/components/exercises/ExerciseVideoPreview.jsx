import {
    Anchor,
    Group,
    Paper,
    Text,
} from '@mantine/core';
import {
    IconExternalLink,
} from '@tabler/icons-react';

function ExerciseVideoPreview({url, title = 'Exercise demo video'}) {
    if (!url || !url.trim()) {
        return null;
    }

    const trimmedUrl = url.trim();
    const youtubeEmbedUrl = getYoutubeEmbedUrl(trimmedUrl);

    if (youtubeEmbedUrl) {
        return (
            <ResponsiveVideoFrame>
                <iframe
                    src={youtubeEmbedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                    }}
                />
            </ResponsiveVideoFrame>
        );
    }

    if (isDirectVideoUrl(trimmedUrl)) {
        return (
            <video
                src={trimmedUrl}
                controls
                style={{
                    width: '100%',
                    borderRadius: '0.5rem',
                    display: 'block',
                }}
            >
                Your browser does not support the video tag.
            </video>
        );
    }

    return (
        <Paper withBorder radius="md" p="md">
            <Group gap="xs">
                <IconExternalLink size={18}/>
                <Anchor href={trimmedUrl} target="_blank" rel="noreferrer">
                    Open demo video
                </Anchor>
            </Group>

            <Text size="xs" c="dimmed" mt={4}>
                This URL cannot be embedded, but it can still be opened externally.
            </Text>
        </Paper>
    );
}

function ResponsiveVideoFrame({children}) {
    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                overflow: 'hidden',
                borderRadius: '0.5rem',
            }}
        >
            {children}
        </div>
    );
}

function getYoutubeEmbedUrl(url) {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname.includes('youtube.com')) {
            if (parsedUrl.pathname === '/watch') {
                const videoId = parsedUrl.searchParams.get('v');
                return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
            }

            if (parsedUrl.pathname.startsWith('/shorts/')) {
                const videoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0];
                return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
            }

            if (parsedUrl.pathname.startsWith('/embed/')) {
                return url;
            }
        }

        if (parsedUrl.hostname === 'youtu.be') {
            const videoId = parsedUrl.pathname.replace('/', '').split('/')[0];
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }

        return null;
    } catch {
        return null;
    }
}

function isDirectVideoUrl(url) {
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export default ExerciseVideoPreview;