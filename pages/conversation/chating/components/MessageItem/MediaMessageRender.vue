<template>
  <view class="media_message_container">
    <!-- 图片消息 -->
    <u--image v-if="isImageMessage" @load="onLoaded" :showLoading="true" width="120" :height="maxHeight" mode="widthFix"
      :src="getImgUrl" @click="clickMediaItem">
      <template v-slot:loading>
        <u-loading-icon color="red"></u-loading-icon>
      </template>
    </u--image>

    <!-- 语音消息 -->
    <view v-else-if="isVoiceMessage" class="voice_container" @click="toggleVoicePlay">
      <image class="voice_icon"
        :src="isPlaying ? '@/static/images/chating_footer_audio_recording.png' : '@/static/images/chating_message_voice.png'"
        alt="语音"></image>
      <view class="voice_wave">
        <view v-for="(item, index) in 3" :key="index" class="wave_item"
          :class="{ active: isPlaying && index === currentWaveIndex }"></view>
      </view>
      <text class="voice_duration">{{ voiceDuration }}''</text>
    </view>
  </view>
</template>

<script>
export default {
  name: "",
  props: {
    message: Object,
  },
  data() {
    return {
      loadingWidth: "120px",
      isPlaying: false,
      audioContext: null,
      waveInterval: null,
      currentWaveIndex: 0
    };
  },
  computed: {
    isImageMessage() {
      return !!this.message.pictureElem;
    },
    isVoiceMessage() {
      return !!this.message.soundElem;
    },
    voiceDuration() {
      if (!this.isVoiceMessage) return 0;
      return this.message.soundElem.duration || 0;
    },
    getImgUrl() {
      if (!this.isImageMessage) return '';
      return (
        this.message.pictureElem.snapshotPicture?.url ??
        this.message.pictureElem.sourcePath
      );
    },
    maxHeight() {
      const imageHeight = this.message.pictureElem.sourcePicture.height;
      const imageWidth = this.message.pictureElem.sourcePicture.width;
      const aspectRatio = imageHeight / imageWidth;
      return 120 * aspectRatio;
    },
  },
  methods: {
    clickMediaItem() {
      uni.previewImage({
        current: 0,
        urls: [this.message.pictureElem.sourcePicture.url],
        indicator: "none",
      });
    },

    // 切换语音播放状态
    toggleVoicePlay() {
      if (this.isPlaying) {
        this.stopVoicePlay();
      } else {
        this.playVoice();
      }
    },

    // 播放语音
    playVoice() {
      if (!this.isVoiceMessage) return;

      // 停止其他正在播放的语音
      this.$emit('stopOtherVoices');

      this.isPlaying = true;

      // 创建音频上下文
      if (!this.audioContext) {
        this.audioContext = uni.createInnerAudioContext();
        console.log(this.message, 123213)
        this.audioContext.src = this.message.soundElem.sourceUrl || this.message.soundElem.soundPath;

        this.audioContext.onPlay(() => {
          console.log('语音开始播放');
          this.startWaveAnimation();
        });

        this.audioContext.onEnded(() => {
          console.log('语音播放结束');
          this.stopVoicePlay();
        });

        this.audioContext.onError((err) => {
          console.error('语音播放错误', err);
          this.stopVoicePlay();
        });
      }

      this.audioContext.play();
    },

    // 停止语音播放
    stopVoicePlay() {
      if (this.isPlaying && this.audioContext) {
        this.audioContext.stop();
      }

      this.isPlaying = false;
      this.stopWaveAnimation();
    },

    // 开始波形动画
    startWaveAnimation() {
      this.waveInterval = setInterval(() => {
        this.currentWaveIndex = (this.currentWaveIndex + 1) % 3;
      }, 300);
    },

    // 停止波形动画
    stopWaveAnimation() {
      if (this.waveInterval) {
        clearInterval(this.waveInterval);
        this.waveInterval = null;
      }
      this.currentWaveIndex = 0;
    },

    // 组件卸载时清理音频资源
    beforeDestroy() {
      this.stopVoicePlay();
      if (this.audioContext) {
        this.audioContext.destroy();
        this.audioContext = null;
      }
    },
    onLoaded() {
      this.loadingWidth = "auto";
    },
  },
};
</script>

<style lang="scss" scoped>
.media_message_container {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;

  .play_icon {
    width: 48px;
    height: 48px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .video_duration {
    position: absolute;
    bottom: 12rpx;
    right: 24rpx;
    color: #fff;
  }

  // 语音消息样式
  .voice_container {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    background-color: #f5f5f5;
    border-radius: 16rpx;
    min-width: 160rpx;
    max-width: 400rpx;

    // 自己发送的消息样式
    :deep(.message_item_self) & {
      background-color: #9EEA6A;
    }
  }

  .voice_icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 16rpx;
  }

  .voice_wave {
    display: flex;
    align-items: center;
    flex: 1;
    height: 40rpx;
    margin-right: 16rpx;
  }

  .wave_item {
    width: 8rpx;
    background-color: #999;
    margin-right: 8rpx;
    border-radius: 4rpx;
    transition: height 0.3s ease;
  }

  .wave_item:nth-child(1) {
    height: 20rpx;
  }

  .wave_item:nth-child(2) {
    height: 32rpx;
  }

  .wave_item:nth-child(3) {
    height: 24rpx;
    margin-right: 0;
  }

  .wave_item.active {
    height: 40rpx !important;
  }

  .voice_duration {
    font-size: 24rpx;
    color: #666;
    min-width: 40rpx;
    text-align: right;
  }
}
</style>
