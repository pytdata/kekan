import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { motion } from 'motion/react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

const VIDEO_QUERY = gql`
  query Video($id: ID!) {
    video(id: $id) {
      id
      title
      description
      thumbnailUrl
      videoUrl
      duration
    }
    watchProgress(videoId: $id) {
      currentTime
      percentComplete
    }
  }
`;

const SAVE_WATCH = gql`
  mutation SaveWatchProgress($input: ProgressInput!) {
    saveWatchProgress(input: $input) {
      id
      percentComplete
    }
  }
`;

const VideoPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading } = useQuery(VIDEO_QUERY, { variables: { id } });
  const [saveWatch] = useMutation(SAVE_WATCH);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<any>(null);

  const video = data?.video;
  const savedProgress = data?.watchProgress;

  useEffect(() => {
    if (savedProgress?.currentTime && videoRef.current) {
      videoRef.current.currentTime = savedProgress.currentTime;
      setCurrentTime(savedProgress.currentTime);
    }
  }, [savedProgress]);

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
    resetControlsTimer();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setDuration(v.duration || 0);
    setProgress((v.currentTime / (v.duration || 1)) * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const time = (parseFloat(e.target.value) / 100) * v.duration;
    v.currentTime = time;
    setProgress(parseFloat(e.target.value));
  };

  const handleSave = async () => {
    try {
      const v = videoRef.current;
      if (!v) return;
      await saveWatch({
        variables: {
          input: {
            videoId: id,
            currentTime: v.currentTime,
            percentComplete: (v.currentTime / (v.duration || 1)) * 100,
          },
        },
      });
      toast.success('Progress saved!');
    } catch {
      toast.error('Failed to save');
    }
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Play className="text-white/30" size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden" onClick={resetControlsTimer}>
      {/* Video */}
      <video
        ref={videoRef}
        src={video?.videoUrl}
        poster={video?.thumbnailUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        muted={muted}
        playsInline
      />

      {/* Top bar */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-black/60 to-transparent"
      >
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { handleSave(); navigate(-1); }} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
          <ArrowLeft size={18} />
        </motion.button>
        <div className="flex-grow">
          <p className="text-sm font-bold text-white truncate">{video?.title}</p>
        </div>
      </motion.div>

      {/* Center play button */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls && !playing ? 1 : 0 }}
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-auto"
        >
          <Play size={28} className="text-white ml-1" fill="white" />
        </motion.button>
      </motion.div>

      {/* Bottom controls */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 z-20 px-4 py-4 bg-gradient-to-t from-black/80 to-transparent"
      >
        {/* Progress bar */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={100}
            value={progress || 0}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-full appearance-none bg-white/30 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={togglePlay} className="text-white">
              {playing ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
            </motion.button>
            <span className="text-xs text-white/80 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMuted(!muted)} className="text-white">
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSave} className="text-rose-400 text-xs font-bold px-2 py-1 bg-white/10 rounded-lg">
              Save
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoPlayerPage;
