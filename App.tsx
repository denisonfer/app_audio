import React, { useMemo } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';

import './src/configs/reactotronConfig';
import { MusicPlayer } from './src/components/MusicPlayer';

export interface IAudioData {
  id: number;
  title: string;
  artist: string;
  url: string;
}

const App = () => {
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

  const renderItemInFlatList: ListRenderItem<IAudioData> = ({
    item,
    index,
  }) => {
    return <MusicPlayer audio={item} index={index} />;
  };

  return (
    <View style={styles.container}>
      <Text>App TocaTUDO</Text>

      <FlatList
        data={audiosData}
        keyExtractor={_item => String(_item.id)}
        renderItem={renderItemInFlatList}
        contentContainerStyle={styles.container}
      />
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
});

export default App;
