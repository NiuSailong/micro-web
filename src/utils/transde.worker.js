class TransWorker {}

TransWorker.prototype.transToAudioData = function (audioDataStr, fromRate = 16000, toRate = 22505) {
  let outputS16 = this.base64ToS16(audioDataStr);
  let output = this.transS16ToF32(outputS16);
  output = this.transSamplingRate(output, fromRate, toRate);
  output = Array.from(output);
  return output;
};

TransWorker.prototype.transSamplingRate = function (data, fromRate = 44100, toRate = 16000) {
  let fitCount = Math.round(data.length * (toRate / fromRate));
  let newData = new Float32Array(fitCount);
  let springFactor = (data.length - 1) / (fitCount - 1);
  newData[0] = data[0];
  for (let i = 1; i < fitCount - 1; i++) {
    let tmp = i * springFactor;
    let before = Math.floor(tmp).toFixed();
    let after = Math.ceil(tmp).toFixed();
    let atPoint = tmp - before;
    newData[i] = data[before] + (data[after] - data[before]) * atPoint;
  }
  newData[fitCount - 1] = data[data.length - 1];
  return newData;
};

TransWorker.prototype.transS16ToF32 = function (input) {
  let tmpData = [];
  for (let i = 0; i < input.length; i++) {
    let d = input[i] < 0 ? input[i] / 0x8000 : input[i] / 0x7fff;
    tmpData.push(d);
  }
  return new Float32Array(tmpData);
};

TransWorker.prototype.base64ToS16 = function (base64AudioData) {
  const temp = atob(base64AudioData);
  const outputArray = new Uint8Array(temp.length);
  for (let i = 0; i < temp.length; ++i) {
    outputArray[i] = temp.charCodeAt(i);
  }
  return new Int16Array(new DataView(outputArray.buffer).buffer);
};

TransWorker.getInstance = (function () {
  let instance;
  return function () {
    instance = instance ? instance : new TransWorker();
    return instance;
  };
})();

export const transWorker = TransWorker.getInstance();
