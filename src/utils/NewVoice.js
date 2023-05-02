import _ from 'lodash';
import { cacheRequest } from '#/utils/request';
import { HttpCode } from '#/utils/contacts';
import alert from '#/components/Alert';

class Voice {
  constructor() {
    this.speakList = new window.Map();
    this.audioBuffer = null;
    this.playTimeout = null;
    this.audioDataOffset = 0;
    this.status = 'init';
    this.speed = 5;
    this.voice = 5;
    this.pitch = 5;
    this.voiceName = 0;
    this.aueType = 3;
    this.text = '';
    this.isMute = false;
    this.speakSlide = {};
    this.callBack = null;
    this.source = null;
    this.token = null;
    this.gainNode = null;
    this.timer = null;
    this.timingTask();
  }
  timingTask() {
    this.timer && clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.getVoiceToken();
    }, 3600000);
    this.getVoiceToken();
  }
  async getVoiceToken(isClear = false) {
    let res = await cacheRequest(
      '/user/speech/getAccessToken',
      { ttl: 86400000 },
      { isForce: isClear },
    );
    if (res?.statusCode === HttpCode.SUCCESS) {
      this.token = res.accessToken;
    }
  }
  // 修改录音听写状态
  setStatus(status) {
    this.status = status;
  }

  // 卸载
  destory(topic, clear) {
    this.resetAudio();
    this.speakList.forEach((n) => {
      if (n.topic === topic) {
        this.speakList.delete(n.text);
      }
    });
    if (this.speakList.size && !clear) {
      this.ready([...this.speakList.values()][0]);
    } else {
      this.clearCallBack();
      this.speakList.clear();
      this.timer && clearInterval(this.timer);
    }
  }

  // 设置回调函数
  setCallBack(callBack = null) {
    this.callBack = callBack;
  }

  // 清空回调函数
  clearCallBack() {
    this.callBack = null;
  }

  // 重置音频数据
  resetAudio() {
    this.audioStop();
  }

  // 音频初始化
  audioInit() {
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.audioContext = new AudioContext();
      this.audioContext.resume();
      this.audioDataOffset = 0;
    }
  }

  // 设置合成相关参数
  setParams({ speed, voice, pitch, text, voiceName }) {
    speed !== undefined && (this.speed = speed);
    voice !== undefined && (this.voice = voice);
    pitch !== undefined && (this.pitch = pitch);
    text && (this.text = text);
    voiceName && (this.voiceName = voiceName);
    this.resetAudio();
  }

  // 播放语音
  async add(list = []) {
    if (list && list?.length === 0) return;
    await this.getVoiceToken();
    if (!this.speakList?.size) {
      this.ready({ ...list[0] });
      this.callBack && this.callBack(this.speakSlide);
    }
    // 保存数据来源
    _.map(list || [], (_t) => {
      this.speakList.set(_t?.text, { ..._t });
    });
  }

  changeVolume() {
    if (this.isMute) {
      this.gainNode.gain.value = 0;
    } else {
      this.gainNode.gain.value = 1;
    }
  }

  stopSound() {
    this.audioStop();
  }

  async playSound() {
    this.setStatus('play');
    // source is global so we can call .stop() later.
    this.audioStop();
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.loop = false;
    this.gainNode = this.audioContext.createGain(); //调节音量、
    this.source.connect(this.gainNode);
    this.changeVolume();
    this.gainNode.connect(this.audioContext.destination);
    this.source.onended = (event) => {
      this.setStatus('end');
      // 语音播放结束
      // if (event.type === 'ended') {
      this.stopSound();
      this.speakList.delete(this.speakSlide?.text);
      this.speakSlide = {};
      if (this.speakList.size) {
        this.ready([...this.speakList.values()][0]);
      }
      // }
    };
    this.source.start(0); // Play immediately.
    if (this.audioContext.state === 'suspended') {
      let res = await alert.warning('由于浏览器限制无法自动播放语音，请确认继续播放 ');
      this.audioContext.resume();
    }
  }
}

Voice.getInstance = (function () {
  let instance;
  return function () {
    instance = instance ? instance : new Voice();
    return instance;
  };
})();

// 准备
Voice.prototype.ready = function (_slide = {}) {
  this.speakSlide = _slide;
  this.audioBuffer = null;
  this.setParams({
    text: _slide?.text || '',
  });
  this.start();
};

// 开始
Voice.prototype.start = function () {
  if (!this.audioContext) {
    this.audioInit();
  }
  if (!this.audioContext) {
    // alert('该浏览器不支持webAudioApi相关接口')
    return;
  }
  this.loadBufferSound();
};

// 音频播放结束
Voice.prototype.audioStop = function () {
  if (this.source) {
    try {
      this.source.stop();
    } catch (e) {}
  }
};

Voice.prototype.dealformData = function (params) {
  let formData = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    formData.append(key, params[key]);
  });
  return formData;
};

// 请求参数构造
Voice.prototype.loadBufferSound = function () {
  // https://ai.baidu.com/ai-doc/SPEECH/Qk38y8lrl#post%E8%B0%83%E7%94%A8%E6%96%B9%E5%BC%8F%EF%BC%88%E6%8E%A8%E8%8D%90%EF%BC%89
  const params = {
    tex: encodeURI(this.text),
    tok: this.token, // token
    cuid: '12345postman',
    ctp: '1', // 客户端类型选择，web端填写固定值1
    lan: 'zh', // 固定值zh。语言选择,目前只有中英文混合模式，填写固定值zh
    spd: this.speed, // 语速，取值0-15，默认为5中语速
    pit: this.pitch, // 音调，取值0-15，默认为5中语调
    vol: this.voice, // 音量，取值0-15，默认为5中音量（取值为0时为音量最小值，并非为无声）
    per: this.voiceName, // 度小宇=1，度小美=0，度逍遥（基础）=3，度丫丫=4  基础音库
    aue: this.aueType, // 3为mp3格式(默认)； 4为pcm-16k；5为pcm-8k；6为wav（内容同pcm-16k）
  };

  const xhr = new XMLHttpRequest();
  const _that = this;
  xhr.open('POST', 'https://tsn.baidu.com/text2audio', true);
  xhr.responseType = 'arraybuffer';
  // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function (e) {
    _that.audioPlay(e.target.response); // this.response is an ArrayBuffer.
  };
  xhr.onloadstart = function (e) {
    _that.callBack && _that.callBack(_that.speakSlide);
  };
  xhr.onreadystatechange = function (e) {};
  xhr.send(_that.dealformData(params));
};

Voice.prototype.bufferToBase64 = function (buffer) {
  const bytes = new Uint8Array(buffer);
  const len = buffer.byteLength;
  let binary = '';
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

Voice.prototype.base64ToBuffer = function (basecode) {
  const binary = window.atob(basecode);
  const buffer = new ArrayBuffer(binary.length);
  let bytes = new Uint8Array(buffer);
  for (let i = 0; i < buffer.byteLength; i++) {
    bytes[i] = binary.charCodeAt(i) & 0xff;
  }
  return buffer;
};

// 音频播放
Voice.prototype.audioPlay = function (arrayBuffer) {
  const _that = this;
  this.audioContext.decodeAudioData(
    arrayBuffer,
    function (buffer) {
      // audioBuffer is global to reuse the decoded audio later.
      _that.audioBuffer = buffer;
      _that.playSound();
    },
    function (e) {
      // eslint-disable-next-line no-console
      console.log('播放错误', e);
      _that.getVoiceToken(true);
      _that.stopSound();
      _that.speakList.delete(_that.speakSlide?.text);
      _that.speakSlide = {};
      if (_that.speakList.size) {
        _that.ready([..._that.speakList.values()][0]);
      }
    },
  );
};

Voice.prototype.onChangeMute = function () {
  this.isMute = !this.isMute;
  this.changeVolume();
};

export const voice = Voice.getInstance();
