<template>
  <view
    @click="playAudio"
    class="audio_message_container bg_container"
    :class="{ audio_message_container_self: isSender }"
  >
    <view class="cricleplay">
      <view class="small"></view>
      <view class="middle" :class="{ stopanimate: !playing }"></view>
      <view class="large" :class="{ stopanimate: !playing }"></view>
    </view>
    <text class="audio_duration">{{ message.soundElem.duration }}''</text>
  </view>
</template>

<script>
import { secFormat } from "@/util/imCommon";
export default {
  name: "AudioMessageRender",
  props: {
    isSender: Boolean,
    message: Object,
  },
  data() {
    return {
      playing: false,
      paused: false,
      innerAudioContext: uni.createInnerAudioContext(),
    };
  },
  mounted() {
    this.setPlayListener();
  },
  beforeDestroy() {
    this.innerAudioContext.destroy();
  },
  methods: {
    setPlayListener() {
      const onPlayHandler = () => {
        this.playing = true;
        this.paused = false;
      };
      const onPauseOrStorHandler = () => {
        this.playing = false;
        this.paused = true;
      };
      this.innerAudioContext.onPlay(onPlayHandler);
      this.innerAudioContext.onPause(onPauseOrStorHandler);
      // this.innerAudioContext.onStop(onPauseOrStorHandler)
      this.innerAudioContext.onEnded(onPauseOrStorHandler);
    },
    playAudio() {
      this.setPlayListener();
      if (this.paused) {
        this.innerAudioContext.play();
        return;
      }
      if (this.playing) {
        this.innerAudioContext.pause();
        return;
      }
      this.innerAudioContext.src = this.message.soundElem.sourceUrl;
      this.innerAudioContext.play();
    },
  },
};
</script>

<style lang="scss" scoped>
.audio_message_container {
  @include vCenterBox();

  .audio_duration {
    font-size: 28rpx;
  }

  .cricleplay {
    display: flex;
    align-items: center;
    margin-right: 12rpx;

    .small {
      width: 5px;
      height: 5px;
      border-style: solid;
      border-color: #3870e4;
      border-top-color: transparent;
      border-left-color: transparent;
      border-bottom-color: transparent;
      border-radius: 50%;
      box-sizing: border-box;
      vertical-align: middle;
      display: inline-block;
    }

    .middle {
      width: 10px;
      height: 10px;
      border-style: solid;
      border-color: #3870e4;
      border-top-color: transparent;
      border-left-color: transparent;
      border-bottom-color: transparent;
      border-radius: 50%;
      box-sizing: border-box;
      vertical-align: middle;
      display: inline-block;
      margin-left: -5px;
      animation: show2 2s ease-in-out infinite;
      opacity: 1;
    }

    @keyframes show2 {
      0% {
        opacity: 0;
      }

      30% {
        opacity: 1;
      }

      100% {
        opacity: 0;
      }
    }

    .large {
      width: 20px;
      height: 20px;
      border-style: solid;
      border-color: #3870e4;
      border-top-color: transparent;
      border-left-color: transparent;
      border-bottom-color: transparent;
      border-radius: 50%;
      box-sizing: border-box;
      vertical-align: middle;
      display: inline-block;
      margin-left: -15px;
      animation: show3 2s ease-in-out infinite;
      opacity: 1;
    }

    @keyframes show3 {
      0% {
        opacity: 0;
      }

      60% {
        opacity: 1;
      }

      100% {
        opacity: 0;
      }
    }

    .stopanimate {
      -moz-animation-name: none;
      -webkit-animation-name: none;
      -ms-animation-name: none;
      animation-name: none;
    }
  }

  &_self {
    flex-direction: row-reverse;

    .cricleplay {
      margin-right: 0;
      margin-left: 12rpx;
      flex-direction: row-reverse;

      .small,
      .middle,
      .large {
        border-left-color: #3870e4;
        border-right-color: transparent;
      }

      .middle {
        margin-left: 0;
        margin-right: -5px;
      }

      .large {
        margin-left: 0;
        margin-right: -15px;
      }
    }
  }
}
</style>
