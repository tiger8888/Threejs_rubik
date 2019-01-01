import * as THREE from '../threejs/three.js'
import UIBase from './UIBase.js'

/**
 * radio
 * uiRadio
 * uiParams : {width,height,radius,backgroundColor,borderTop,borderRight,borderBottom,borderLeft,borderColor,fontSize,fontColor,fontFamily,content}
 * plane
 * realWidth
 * realHeight
 * width
 * height
 * screenRect : {width,height,left,top}
 */

export default class UIComponent extends UIBase {
  
  constructor(main) {
    super(main);
    this.radio = this.main.originWidth / 750;
    this.uiRadio = this.main.uiRadio;
  }

  /**
   * 在场景中显示
   */
  showInScene(){
    this.main.scene.add(this.plane);
  }

  /**
   * 在场景中隐藏
   */
  hideInScene(){
    this.main.scene.remove(this.plane);
  }

  /**
   * 创建UI元素
   */
  create(uiParams){
    this.uiParams = uiParams;
    this.setSize(this.uiParams.width,this.uiParams.height);
    var geometry = new THREE.PlaneGeometry(this.width, this.height);
    var texture = new THREE.CanvasTexture(this._background());
    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    this.plane = new THREE.Mesh(geometry, material);
    this.showInScene();
  }

  /**
   * 设置尺寸
   */
  setSize(width,height){
    //实际尺寸
    this.realWidth = width;
    this.realHeight = height;

    //逻辑尺寸
    this.width = this.realWidth * this.radio;
    this.height = this.realHeight * this.radio;

    //屏幕尺寸
    this.screenRect = {
      width: this.width / this.main.uiRadio,
      height: this.height / this.main.uiRadio
    }
  }

  /**
   * 判断是否在范围内
   */
  isHover(touch) {
    var isHover = false;
    if (touch.clientY >= this.screenRect.top && touch.clientY <= this.screenRect.top + this.screenRect.height && touch.clientX >= this.screenRect.left && touch.clientX <= this.screenRect.left + this.screenRect.width) {
      isHover = true;
    }
    return isHover;
  }

  /**
   * 加载纹理背景
   */
  loadBackground(url,callback){
    var self = this;
    var loader = new THREE.TextureLoader();
    loader.load(url, function (texture) {
      var geometry = new THREE.PlaneBufferGeometry(self.width, self.height);
      var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      self.plane = new THREE.Mesh(geometry, material);
      self.plane.position.set(0, 0, 0);
      self.showInScene();
      if (callback){
        callback();
      }
    }, function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (xhr) {
      console.log('An error happened');
    });
  }

  /**
   * 设置位置
   */
  setPosition(x,y,z){
    if(x){
      this.plane.position.x = x;
    }
    if(y){
      this.plane.position.y = y;
    }
    if(z){
      this.plane.position.z = z;
    }

    this.screenRect.left = (this.main.originWidth / 2 + this.plane.position.x - this.width / 2) / this.main.uiRadio;
    this.screenRect.top = (this.main.originHeight / 2 - this.plane.position.y - this.height / 2) / this.main.uiRadio;
  }

  /**
   * 返回中心位置
   */
  getPosition() {
    return this.plane.position.clone();
  }

  //创建圆角矩形
  _radiusRect(canvas, radius, width, height, backgroundColor) {
    radius = radius ? radius : 0;
    var min = width > height ? height : width;
    if (radius * 2 > min) {
      radius = min / 2;
    }
    //暂时不考虑padding、margin，所以起始位置为左上角
    var x = 0;
    var y = 0;

    var context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);//quadraticCurveTo二次贝塞尔曲线
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.strokeStyle = backgroundColor;
    context.stroke();
    context.fillStyle = backgroundColor;
    context.fill();
    context.closePath();
  }

  //文字
  _text(canvas, fontSize, fontFamily, fontColor, content){
    var context = canvas.getContext('2d');
    var fontStyle = fontSize + ' ' + fontFamily;
    //context.font = fontStyle;
    console.log(fontStyle);
    //context.fillStyle = fontColor;
    //context.fillText(content, 0, 0, canvas.width);

    context.font = '50px serif';
    context.fillText('Hello world', 50, 90);
  }

  //边框
  _border(canvas,top,right,bottom,left,color){
    var context = canvas.getContext('2d');
    context.beginPath();
    context.strokeStyle = color;
    if(top>0){
      context.lineWidth = top;
      context.moveTo(0, 0);
      context.lineTo(canvas.width, 0);
    }
    if(right>0){
      context.lineWidth = right;
      context.moveTo(canvas.width, 0);
      context.lineTo(canvas.width, canvas.height);
    }
    if(bottom>0){
      context.lineWidth = bottom;
      context.moveTo(canvas.width, canvas.height);
      context.lineTo(0, canvas.height);
    }
    if(left>0){
      context.lineWidth = left;
      context.moveTo(0, canvas.height);
      context.lineTo(0, 0);
    }
    context.closePath();
    context.stroke()
  }

  //生成背景素材
  _background() {
    var canvas = document.createElement('canvas');
    canvas.width = this.realWidth;
    canvas.height = this.realHeight;
    this._radiusRect(canvas, this.uiParams.radius, this.realWidth, this.realHeight, this.uiParams.backgroundColor);
    if (!this.uiParams.radius){//暂时不支持圆角边框
      this._border(canvas, this.uiParams.borderTop, this.uiParams.borderRight, this.uiParams.borderBottom, this.uiParams.borderLeft, this.uiParams.borderColor)
    }
    if (this.uiParams.content){
      this._text(canvas, this.uiParams.fontSize, this.uiParams.fontFamily, this.uiParams.fontColor, this.uiParams.content);
    }
    return canvas;
  }
}