import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TrackPlayer, {
  Capability,
  useProgress,
} from 'react-native-track-player';
import Lottie from 'lottie-react-native';
import Slider from '@react-native-community/slider';

import '../src/configs/reactotronConfig';

interface IAudioData {
  id: number;
  title: string;
  artist: string;
  url: string;
}

const App = () => {
  const lottieRef = useRef<Lottie[]>([]);
  const audiosData: IAudioData[] = useMemo(
    () => [
      {
        id: 1,
        title: 'audio 1',
        artist: 'audio 1',
        url: 'https://65381g.ha.azioncdn.net/9/9/5/3/onlinepontocom-01-mais-uma-vez.mp3',
      },
      {
        id: 2,
        title: 'audio 2',
        artist: 'audio 2',
        url: 'https://ringtones-mp3.com/mobile-rington/_ld/26/2648_mobile-rington..mp3',
      },
      {
        id: 3,
        title: 'audio 3',
        artist: 'audio 3',
        url: 'https://ringtones-mp3.com/mobile-rington/_ld/4/493_mobile-rington..mp3',
      },
    ],
    [],
  );

  const progressAudio = useProgress();
  const statusPlayerData = useMemo(
    () => ({
      playing: 1,
      paused: 0,
    }),
    [],
  );

  useEffect(() => {
    const setupService = async (): Promise<boolean> => {
      let isSetup = false;
      try {
        // this method will only reject if player has not been setup yet
        await TrackPlayer.getCurrentTrack();
        await TrackPlayer.setRate(1);
        isSetup = true;
      } catch {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          stopWithApp: false,
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SetRating,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SetRating,
          ],
        });
        await TrackPlayer.add(audiosData);
        await TrackPlayer.setRate(1);

        isSetup = true;
      } finally {
        return isSetup;
      }
    };

    setupService();

    return () => TrackPlayer.destroy();
  }, [audiosData]);

  const [statusPlayer, setStatusPlayer] = useState(statusPlayerData.paused);
  const [speedPlayer, setSpeedPlayer] = useState(1);
  const [currentIndexAudioPlaying, setCurrentIndexAudioPlaying] = useState(0);

  const handlePlayAndPause = useCallback(
    async (audio: IAudioData, index: number) => {
      if (statusPlayer === statusPlayerData.playing) {
        setStatusPlayer(statusPlayerData.paused);
      } else {
        setStatusPlayer(statusPlayerData.playing);
      }

      const currentTrackIndex = await TrackPlayer.getCurrentTrack();

      if (currentTrackIndex !== null) {
        setCurrentIndexAudioPlaying(currentTrackIndex);
        const currentAudio = await TrackPlayer.getTrack(currentTrackIndex);
        if (
          currentAudio?.url === audio.url &&
          statusPlayer === statusPlayerData.paused
        ) {
          await TrackPlayer.play();
          lottieRef.current[index].play(0, 45);
        } else if (
          currentAudio?.url !== audio.url &&
          statusPlayer === statusPlayerData.paused
        ) {
          await TrackPlayer.skip(index);
          await TrackPlayer.play();
          lottieRef.current[index].play(0, 45);
        } else if (statusPlayer === statusPlayerData.playing) {
          await TrackPlayer.pause();
          lottieRef.current[index].play(45, 0);
        } else {
          await TrackPlayer.play();
          lottieRef.current[index].play(0, 45);
        }
      } else {
        setCurrentIndexAudioPlaying(index);
        await TrackPlayer.play();
        lottieRef.current[index].play(0, 45);
      }
    },
    [statusPlayer, statusPlayerData.paused, statusPlayerData.playing],
  );

  return (
    <View style={styles.container}>
      <Text>App TocaTUDO</Text>

      <TouchableOpacity
        onPress={async () => {
          const tracks = await TrackPlayer.getQueue();
          console.tron.log('tracks: ', tracks);
        }}>
        <Text>Listar áudios</Text>
      </TouchableOpacity>

      {audiosData.map((_audio, _index) => (
        <View key={_audio.id} style={styles.componentPlayer}>
          <View style={styles.containerPlayer}>
            <TouchableOpacity
              style={styles.buttonPlayPause}
              onPress={() => handlePlayAndPause(_audio, _index)}>
              <Lottie
                ref={ref => {
                  lottieRef.current[_index] = ref;
                }}
                source={require('./src/assets/lottie/play-pause.json')}
                autoPlay={false}
                loop={false}
              />
            </TouchableOpacity>

            <View style={styles.containerSliderAndProgress}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                value={
                  _index === currentIndexAudioPlaying
                    ? progressAudio.position
                    : 0
                }
                maximumValue={
                  _index === currentIndexAudioPlaying
                    ? progressAudio.duration
                    : 0
                }
                minimumTrackTintColor="#102693"
                maximumTrackTintColor="#DADCE3"
              />
            </View>
            <TouchableOpacity style={styles.buttonPlayPause}>
              <Text>{speedPlayer}x</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowProgress}>
            <Text>
              {_index === currentIndexAudioPlaying
                ? new Date(progressAudio.position * 1000)
                    .toLocaleTimeString()
                    .substring(3)
                : '00:00'}
            </Text>
            <Text style={{ alignSelf: 'flex-end' }}>
              {_index === currentIndexAudioPlaying
                ? new Date(progressAudio.duration * 1000)
                    .toLocaleTimeString()
                    .substring(3)
                : '00:00'}
            </Text>
          </View>
        </View>
      ))}

      <TouchableOpacity onPress={async () => await TrackPlayer.stop()}>
        <Text>PARAR TUDO</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
  },
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

export default App;
