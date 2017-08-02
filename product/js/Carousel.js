//依赖move.js
;(function (window,undefined) {
  var Carousel=function () {
    this.settings={
      id:'pic',          //轮播图父级id
      autoplay:true,     //自动播放
      intervalTime:1000, //间隔时间
      loop:true,         //循环播放
      totalNum:5,        //图片总量
      moveNum:1,         //运动图片的数量
      circle:true,       //圆点功能
      moveWay:'opacity'  //运动方式opacity为透明度，position为位置
    }
  };
  Carousel.prototype={
    constructor:Carousel,
    init:function (opt) {//默认参数
      var opt=opt||this.settings;
      for(var attr in opt){
        this.settings[attr]=opt[attr];
      }
      this.createDom();
    },
    createDom:function () {//创建结构
      var This=this;
      this.box=document.getElementById(this.settings.id);
      this.prevBtn=document.createElement('div');//创建按钮
      this.prevBtn.className='prev';
      this.prevBtn.innerHTML='<';
      if(!this.settings.loop){//如果不支持循环，一开始的时候让左键为灰色
        this.prevBtn.style.background='#e7e2d7'
      }
      this.prevBtn.onclick=function () {
        This.prev();
        This.trigger('leftClick')  //触发自定义事件

      };
      this.box.appendChild(this.prevBtn);
      //创建下一个按钮
      this.nextBtn=document.createElement('div');
      this.nextBtn.className='next';
      this.nextBtn.innerHTML='>';
      this.nextBtn.onclick=function () {
        This.next();
        This.trigger('rightClick')
      };
      this.box.appendChild(this.nextBtn);
      //创建圆点
      this.circleWrap=document.createElement('div');//创建一个div
      this.circleWrap.className='circle';
      this.circles=[];//存圆点
      //y圆点数量=     总量/走的图片数量
      for(var i=0;i<this.settings.totalNum/this.settings.moveNum;i++){
        var span=document.createElement('span');
        span.index=i;//绑定每个圆点的index
        span.onclick=function () {
          This.cn=this.index;
          This[This.settings.moveWay+'Fn']();//看看传入的是option还是opcity
        };
        this.circleWrap.appendChild(span);
        this.circles.push(span);
      }
      this.circles[0].className='active';
      if(this.settings.circle){
        this.box.appendChild(this.circleWrap)
      }
      this.moveInit();//调用运动函数

    },
    moveInit:function () {
      this.cn=0;//当前索引
      this.ln=0;//上一索引
      this.canClick=true;//是否可以再次点击
      this.endNum=this.settings.totalNum/this.settings.moveNum;//停止的条件
      this.opacityItem=this.box.children[0].children;
      this.positionItemWrap=this.box.children[0].children[0];//运动位置的元素的父级
      this.positionItem=this.positionItemWrap.children;//li
      switch(this.settings.moveWay){
        case 'opacity':            //设置透明度与transtion
          for(var i=0;i<this.opacityItem.length;i++){
          this.opacityItem[i].style.opacity=0;
            this.opacityItem[i].style.transition='0.3s opacity';
          }
          this.opacityItem[0].style.opacity=1;
          break;
        case 'position':           //需要设置父级的宽度
          //需要考虑margin
          var leftMargin=parseInt(getComputedStyle(this.positionItem[0]).marginLeft);
          var rightMargin=parseInt(getComputedStyle(this.positionItem[0]).marginRight);
          this.singleWidth=leftMargin+this.positionItem[0].offsetWidth+rightMargin;
          if(this.settings.loop){
            //复制
            this.positionItemWrap.innerHTML+=this.positionItemWrap.innerHTML;
          }
          this.positionItemWrap.style.width=this.singleWidth*this.positionItem.length+'px';//ul的宽度
          break;
      }
      if(this.settings.autoplay&&this.settings.loop){
        this.autoPlay();

      }


    },
    opacityFn:function(){//透明度运动方式
      //左边到头
      if(this.cn<0){
        if(this.settings.loop){
          //循环
          this.cn=this.endNum-1;
        }else {
          this.cn=0;
          this.canClick=true;//解决点击头一张后不能再次点击，没触发transitionend

        }
      }
      //右边到头
      if(this.cn>this.endNum-1){
        if(this.settings.loop){
          //循环
          this.cn=0;
        }else {
          this.cn=this.endNum-1;
          this.canClick=true;//解决点击头一张后不能再次点击，没触发transitionend

        }
      }
      var This=this;
      var en=false;
      this.opacityItem[this.ln].style.opacity=0;
      this.circles[this.ln].className='';
      this.opacityItem[this.cn].style.opacity=1;
      this.circles[this.cn].className='active';
      this.opacityItem[this.cn].addEventListener('transitionend',function () {
        en=true;
        if(en){
          This.canClick=true;
          This.ln=This.cn;
          This.endFn();
        }
      });
      this.ln=this.cn;
    },
    positionFn:function () {
      //左边到头
      if(this.cn<0){
        if(this.settings.loop){
          //循环
          /*1、先让运动的父级的位置到中间
          * 2、同时修改索引值(到中间,要运动出前一排)
          */
          this.positionItemWrap.style.left=-this.positionItemWrap.offsetWidth/2+'px';
          this.cn=this.endNum-1;
        }else {
          //不循环
          this.cn=0;
        }
      }
      //右边到头
      if(this.cn>this.endNum-1&&!this.settings.loop){
        this.cn=this.endNum-1;
      }
      var This=this;
      //修改圆点，只有不循环的时候才去修改圆点
      if(!this.settings.loop){
        this.circles[this.ln].className='';
        this.circles[this.cn].className='active';
      }
      //运动
      //left的值=一个元素宽度*cn*一次运动元素的个数
      move(this.positionItemWrap,{left:-this.cn*this.singleWidth*this.settings.moveNum},
      300,'linear',function () {
        //走到第二屏的时候让运动的父级的left为0；
            if(This.cn==This.endNum){
              this.style.left=0;
              This.cn=0;
            }
            This.endFn();//调用自定义事件
            This.canClick=true;
            This.ln=This.cn;
          })

    },
    prev:function () {//上一个按钮点击功能
      if(!this.canClick){
        return;
      }
      this.canClick=false;

      this.cn--;
      this[this.settings.moveWay+'Fn']();

    },
    next:function () {//下一个按钮
      if(!this.canClick){
        return;
      }
      this.canClick=false;
      this.cn++;
      this[this.settings.moveWay+'Fn']();
    },
    autoPlay:function () {//自动播放功能
      var This=this;
      this.timer=setInterval(function () {

        This.next();

      },This.settings.intervalTime);
      this.box.onmouseenter=function () {
        clearInterval(This.timer);
        This.timer=null;
      };
      this.box.onmouseleave=function () {
        This.autoPlay();
      }
    },
    //自定义事件
    on:function(type,listener){//添加自定义事件
      this.events=this.events||{};
      this.events[type]=this.events[type]||[];
      this.events[type].push(listener);
    },
    //触发器
    trigger:function(type){//调用自定义事件
      //判断组件是否有自定义事件
      //不为空且存在type
      if(this.events&&this.events[type]){
        for(var i=0;i<this.events[type].length;i++){
          this.events[type][i].call(this);//this.events[type]再里面一层的this不是指向构造函数

        }

      }
    },
    endFn:function () {
      //同意添加自定义事件的函数，要在运动完成以后添加，并且需要加给不循环的运动
      if(!this.settings.loop){
        if(this.cn==0){
          this.trigger('leftEnd');
        }
        if(this.cn==this.endNum-1){
          //右边到头
          this.trigger('rightEnd')
        }
      }

    }


  };
  window.Carousel=Carousel;
})(window,undefined);
