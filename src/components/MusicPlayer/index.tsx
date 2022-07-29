import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AnimatedLottieView from 'lottie-react-native';
import { IAudioData } from '../../../App';
import Slider from '@react-native-community/slider';
import Sound from 'react-native-sound';

interface IComponentProps {
  audio: IAudioData;
  index: number;
}

export const MusicPlayer = ({ audio, index }: IComponentProps) => {
  const lottieRef = useRef<AnimatedLottieView>(null);
  const statusPlayerData = useMemo(
    () => ({
      paused: 0,
      playing: 1,
      stopped: 2,
    }),
    [],
  );

  const audioSound = useMemo(() => {
    const sound = new Sound(audio.url, undefined, error => {
      if (error) {
        console.tron.log('ERRO SOUND', error);
        return;
      }
      console.tron.log('ÁUDIOS CARREGADOS');
    });

    return sound;
  }, [audio.url]);

  const [statusPlayer, setStatusPlayer] = useState(statusPlayerData.stopped);
  const [speedPlayer, setSpeedPlayer] = useState(1);
  const [totalDurationAudio, setTotalDurationAudio] = useState(0);
  const [currentTimeAudio, setCurrentTimeAudio] = useState(0);
  console.tron.log('currentTimeAudio: ', currentTimeAudio);
  const [timeOnPause, setTimeOnPause] = useState(0);
  console.tron.log('timeOnPause: ', timeOnPause);

  useEffect(() => {
    audioSound.getCurrentTime(seconds => setCurrentTimeAudio(seconds));
  }, [audioSound]);

  // controls audio
  const handlePlay = useCallback(async () => {
    const duration = audioSound.getDuration();
    setTotalDurationAudio(duration);
    audioSound.play();

    lottieRef.current?.play(0, 45);
    setStatusPlayer(statusPlayerData.playing);
  }, [audioSound, statusPlayerData.playing]);

  const handlePause = useCallback(async () => {
    audioSound.pause();
    audioSound.getCurrentTime((seconds, isPlaying) => {
      if (!isPlaying) {
        setTimeOnPause(seconds);
      }
    });

    lottieRef.current?.play(45, 9);
    setStatusPlayer(statusPlayerData.paused);
  }, [audioSound, statusPlayerData.paused]);

  const handleResumePlay = useCallback(async () => {
    audioSound.setCurrentTime(
      timeOnPause !== currentTimeAudio ? currentTimeAudio : timeOnPause,
    );
    audioSound.play();

    lottieRef.current?.play(0, 45);
    setStatusPlayer(statusPlayerData.playing);
  }, [audioSound, currentTimeAudio, statusPlayerData.playing, timeOnPause]);

  const handleAction = useCallback(async () => {
    if (statusPlayer === statusPlayerData.stopped) {
      return handlePlay();
    } else if (statusPlayer === statusPlayerData.paused) {
      return handleResumePlay();
    } else {
      return handlePause();
    }
  }, [
    handlePause,
    handlePlay,
    handleResumePlay,
    statusPlayer,
    statusPlayerData.paused,
    statusPlayerData.stopped,
  ]);

  const handleSpeedUp = useCallback(() => {
    const newValueToSpeed = speedPlayer + 0.5;

    setSpeedPlayer(speedPlayer === 2 ? 0.5 : newValueToSpeed);
    audioSound.setSpeed(speedPlayer === 2 ? 0.5 : newValueToSpeed);
  }, [audioSound, speedPlayer]);

  // controls time
  const handleGetCurrentTimeAudio = useCallback(() => {
    audioSound.getCurrentTime(seconds => {
      setCurrentTimeAudio(seconds);
    });
  }, [audioSound]);

  const handleCheckIsPlaying = useCallback(() => {
    const isPlaying = audioSound.isPlaying();
    if (!isPlaying && currentTimeAudio === 0 && totalDurationAudio > 0) {
      lottieRef.current?.play(45, 9);
      audioSound.stop();
      setStatusPlayer(statusPlayerData.stopped);
    }
  }, [
    audioSound,
    currentTimeAudio,
    statusPlayerData.stopped,
    totalDurationAudio,
  ]);

  useEffect(() => {
    let currentTimeRunning = 0;
    if (statusPlayer === statusPlayerData.playing) {
      currentTimeRunning = setInterval(() => {
        handleGetCurrentTimeAudio();
        handleCheckIsPlaying();
      }, 1000);
    }

    return () => clearInterval(currentTimeRunning);
  }, [
    audioSound,
    handleCheckIsPlaying,
    handleGetCurrentTimeAudio,
    statusPlayer,
    statusPlayerData.playing,
  ]);

  return (
    <View key={audio.id} style={styles.componentPlayer}>
      <View style={styles.containerPlayer}>
        <TouchableOpacity style={styles.buttonPlayPause} onPress={handleAction}>
          <AnimatedLottieView
            ref={lottieRef}
            source={require('../../assets/lottie/play-pause.json')}
            autoPlay={false}
            loop={false}
          />
        </TouchableOpacity>

        <View style={styles.containerSliderAndProgress}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            value={currentTimeAudio}
            onValueChange={time => {
              audioSound.setCurrentTime(time);
              setCurrentTimeAudio(time);
            }}
            maximumValue={totalDurationAudio}
            minimumTrackTintColor="#102693"
            maximumTrackTintColor="#DADCE3"
          />
        </View>
        <TouchableOpacity
          style={styles.buttonPlayPause}
          onPress={handleSpeedUp}>
          <Text>{speedPlayer}x</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowProgress}>
        <Text>
          {new Date(currentTimeAudio * 1000).toLocaleTimeString().substring(3)}
        </Text>
        <Text style={{ alignSelf: 'flex-end' }}>
          {new Date(totalDurationAudio * 1000)
            .toLocaleTimeString()
            .substring(3)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  componentPlayer: {
    marginVertical: 10,
  },
  containerPlayer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  buttonPlayPause: {
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  slider: {
    height: 45,
    width: 200,
  },
  containerSliderAndProgress: {},
  rowProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'center',
    width: 200,
    marginTop: -26,
  },
});
