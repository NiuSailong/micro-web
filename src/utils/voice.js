import { transWorker } from './transde.worker';
import CyBase64 from 'crypto-js/enc-base64';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import { Base64 } from 'js-base64';
import _ from 'lodash';

const APP_ID = 'ca281d87';
const API_SECRET = 'OGVmZDM4YWUwNDZmYTY4M2ZiZDNmNTVj';
const API_KEY = '24a7d489feee58c94e6b0837bdb3a309';

class Voice {
  constructor() {
    this.speakList = new window.Map();
    this.audioData = [];
    this.playTimeout = null;
    this.audioDataOffset = 0;
    this.status = 'init';
    this.speed = 50;
    this.voice = 50;
    this.pitch = 50;
    this.voiceName = 'xiaoyan';
    this.tte = 'UTF8';
    this.text = '';
    this.isMute = false;
    this.speakSlide = {};
    this.callBack = null;
  }
  getWebsocketUrl() {
    return new Promise((resolve) => {
      let apiKey = API_KEY,
        apiSecret = API_SECRET,
        url = 'wss://tts-api.xfyun.cn/v2/tts',
        host = location.host,
        date = new Date().toGMTString(),
        algorithm = 'hmac-sha256',
        headers = 'host date request-line';

      const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/tts HTTP/1.1`;
      const signatureSha = HmacSHA256(signatureOrigin, apiSecret);
      const signature = CyBase64.stringify(signatureSha);
      const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
      const authorization = btoa(authorizationOrigin);
      url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
      resolve(url);
    });
  }

  // 修改录音听写状态
  setStatus(status) {
    this.status = status;
  }

  // 卸载
  destory() {
    this.resetAudio();
    this.clearCallBack();
    this.speakList.clear();
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
    this.setStatus('init');
    this.audioDataOffset = 0;
    this.audioData = [];
    this.ttsWS && this.ttsWS.close();
    clearTimeout(this.playTimeout);
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
  setParams({ speed, voice, pitch, text, voiceName, tte }) {
    speed !== undefined && (this.speed = speed);
    voice !== undefined && (this.voice = voice);
    pitch !== undefined && (this.pitch = pitch);
    text && (this.text = text);
    tte && (this.tte = tte);
    voiceName && (this.voiceName = voiceName);
    this.resetAudio();
  }

  // 播放语音
  add(list = []) {
    if (!list?.length) return;
    if (!this.speakList.size) {
      this.ready({ ...list[0] });
    }
    _.map(list || [], (_t) => {
      this.speakList.set(_t?.text, { ..._t });
    });
  }

  // 删除
  delete(_s = {}) {
    this.speakList.delete(_s?.text);
    this.promiseFun(this.speakList.has(_s?.text));
  }

  promiseFun(bool = true) {
    return new Promise((resolve, reject) => {
      if (bool) {
        reject(false);
      } else {
        resolve(true);
      }
    });
  }

  stop() {
    this.audioStop();
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
  this.setParams({
    text: _slide?.text || '',
  });
  this.start();
};

// 开始
Voice.prototype.start = function () {
  if (this.audioData.length) {
    this.audioPlay();
  } else {
    if (!this.audioContext) {
      this.audioInit();
    }
    if (!this.audioContext) {
      // alert('该浏览器不支持webAudioApi相关接口')
      return;
    }
    this.connectWebSocket();
  }
};

// 音频播放结束
Voice.prototype.audioStop = function () {
  this.setStatus('endPlay');
  clearTimeout(this.playTimeout);
  this.audioDataOffset = 0;
  if (this.bufferSource) {
    try {
      this.bufferSource.stop();
    } catch (e) {
      //
    }
  }
};

// 连接websocket
Voice.prototype.connectWebSocket = function () {
  this.setStatus('ttsing');
  return this.getWebsocketUrl().then((url) => {
    let ttsWS;
    if ('WebSocket' in window) {
      ttsWS = new WebSocket(url);
    } else if ('MozWebSocket' in window) {
      ttsWS = new MozWebSocket(url);
    } else {
      // alert('浏览器不支持WebSocket');
      return;
    }
    this.ttsWS = ttsWS;
    ttsWS.onopen = () => {
      this.webSocketSend();
      // this.playTimeout = setTimeout(() => {
      //   if(this.audioData?.length){
      //     this.audioPlay();
      //   }
      // }, 1000)
    };
    ttsWS.onmessage = (e) => {
      this.result(e.data);
    };
    ttsWS.onerror = () => {
      clearTimeout(this.playTimeout);
      this.setStatus('errorTTS');
      // alert('WebSocket报错，请f12查看详情');
    };
    ttsWS.onclose = () => {
      if (this.audioData?.length) {
        this.audioPlay();
        this.callBack && this.callBack(this.speakSlide);
      }
    };
  });
};

// websocket接收数据的处理
Voice.prototype.result = function (resultData) {
  let jsonData = JSON.parse(resultData);
  // 合成失败
  if (jsonData.code !== 0) {
    // alert(`合成失败: ${jsonData.code}:${jsonData.message}`);
    this.resetAudio();
    return;
  }
  let res = transWorker.transToAudioData(jsonData.data.audio);
  this.audioData.push(...res);

  if (jsonData.code === 0 && jsonData.data.status === 2) {
    this.ttsWS.close();
  }
};

// websocket发送数据
Voice.prototype.webSocketSend = function () {
  let params = {
    common: {
      app_id: APP_ID,
    },
    business: {
      aue: 'raw',
      auf: 'audio/L16;rate=16000',
      vcn: this.voiceName,
      speed: this.speed,
      volume: this.voice,
      pitch: this.pitch,
      bgs: 0,
      tte: this.tte,
    },
    data: {
      status: 2,
      text: this.encodeText(this.text || '', this.tte === 'unicode' ? 'base64&utf16le' : ''),
    },
  };
  this.ttsWS.send(JSON.stringify(params));
};

Voice.prototype.encodeText = function (text, encoding) {
  switch (encoding) {
    case 'utf16le': {
      let buf = new ArrayBuffer(text.length * 4);
      let bufView = new Uint16Array(buf);
      for (let i = 0, strlen = text.length; i < strlen; i++) {
        bufView[i] = text.charCodeAt(i);
      }
      return buf;
    }
    case 'buffer2Base64': {
      let binary = '';
      let bytes = new Uint8Array(text);
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    }
    case 'base64&utf16le': {
      return this.encodeText(this.encodeText(text, 'utf16le'), 'buffer2Base64');
    }
    default: {
      return Base64.encode(text);
    }
  }
};

// 音频播放
Voice.prototype.audioPlay = function () {
  if (this.isMute) {
    this.speakList.delete(this.speakSlide?.text);
    this.promiseFun(this.speakList.has(this.speakSlide?.text));
    // this.callBack&&this.callBack(this.speakSlide);
    this.speakSlide = {};
    if (this.speakList.size) {
      this.ready([...this.speakList.values()][0]);
    }
    return;
  }
  this.setStatus('play');
  let audioData = this.audioData.slice(this.audioDataOffset);
  this.audioDataOffset += audioData.length;
  let audioBuffer = this.audioContext.createBuffer(1, audioData.length, 22050);
  let nowBuffering = audioBuffer.getChannelData(0);
  if (audioBuffer.copyToChannel) {
    audioBuffer.copyToChannel(new Float32Array(audioData), 0, 0);
  } else {
    for (let i = 0; i < audioData.length; i++) {
      nowBuffering[i] = audioData[i];
    }
  }
  let bufferSource = (this.bufferSource = this.audioContext.createBufferSource());
  bufferSource.buffer = audioBuffer;
  bufferSource.connect(this.audioContext.destination);
  bufferSource.start();
  bufferSource.onended = (event) => {
    if (this.status !== 'play') {
      return;
    }
    if (this.audioDataOffset < this.audioData.length) {
      this.audioPlay();
    } else {
      this.audioStop();
    }
    // 语音播放结束
    if (event.type === 'ended') {
      this.speakList.delete(this.speakSlide?.text);
      this.promiseFun(this.speakList.has(this.speakSlide?.text));
      // this.callBack&&this.callBack(this.speakSlide);
      this.speakSlide = {};
      if (this.speakList.size) {
        this.ready([...this.speakList.values()][0]);
      }
    }
  };
};

Voice.prototype.onChangeMute = function () {
  this.isMute = !this.isMute;
};

export const voice = Voice.getInstance();
