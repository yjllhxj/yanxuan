//yx挂载到window身上
window.yx={
  //封装获取
  g:function (name) {
    return document.querySelector(name);
  },
  ga:function (name) {
    return document.querySelectorAll(name);
  },
  //事件监听
  addEvent:function (obj,ev,fn) {
    if(obj.addEventListener){
      obj.addEventListener(ev,fn);
    }else {
      obj.attachEvent('on'+ev,fn);
    }
  },
  removeEvent:function (obj,ev,fn) {
    if(obj.removeEventListener){
      obj.removeEventListener(ev,fn);
    }else{
      obj.detachEvent('on'+ev,fn)
    }
  },
  getTopValue:function (obj) {//获取元素离html的距离
    var top=0;
    while (obj.offsetParent){//当元素没有父级是定位的，那会一直找到html
      top+=obj.offsetTop;
      obj=obj.offsetParent;
    }
    return top;
  },
  cutTime:function(target){	//倒计时
    var currentDate=new Date();
    var v=Math.abs(target-currentDate);

    return {
      d:parseInt(v/(24*3600000)),
      h:parseInt(v%(24*3600000)/3600000),
      m:parseInt(v%(24*3600000)%3600000/60000),
      s:parseInt(v%(24*3600000)%3600000%60000/1000)
    };
  },
  format:function(v){		//给时间补0
    return v<10?'0'+v:v;
  },
  formatDate:function(time){
    var d=new Date(time);
    return d.getFullYear()+'-'+yx.format(d.getMonth()+1)+'-'+yx.format(d.getDate())+' '+yx.format(d.getHours())+':'+yx.format(d.getMinutes());
  },
  parseUrl:function (url) {//url后面的参数解析成对象
    var reg=/(\w+)=(\w+)/ig;
    var result={};
    url.replace(reg,function (a,b,c) {//整体，第一个，第二个子项
      result[b]=c;

    })
    return result;

  },
  //公用的功能
  public:{
    //导航条的功能
    navFn:function () {
      var nav=yx.g('.nav');
      var lis=yx.ga('.navBar li');
      var subNav=yx.g('.subNav');
      var uls=yx.ga('.subNav ul');
      var newLis=[];//存储实际有用的li
      //获取所有需要hover的li
      for(var i=1;i<lis.length-3;i++){
        newLis.push(lis[i]);
      }
      for(var i=0;i<newLis.length;i++){
        newLis[i].index=uls[i].index=i;
        newLis[i].onmouseenter=uls[i].onmouseenter=function () {
          newLis[this.index].className='active';
          subNav.style.opacity=1;
          uls[this.index].style.display='block';
        };
        newLis[i].onmouseleave=uls[i].onmouseleave=function () {
            newLis[this.index].className='';
            subNav.style.opacity=0;
            uls[this.index].style.display='none';

          };
      }
      yx.addEvent(window,'scroll',setNavPos);//添加滚动条事件
      setNavPos();
      function setNavPos(){
        nav.id=window.pageYOffset>nav.offsetTop?'navFix':'';
      }
    },
    //购物车功能
    shopFn:function(){

      //购物车添加商品展示
      var productNum=0;//加入了几个商
      (function (local) {
        var totalPrice=0;//总价
        var ul=yx.g('.cart ul');

        var li='';
        ul.innerHTML='';
        for(var i=0;i<local.length;i++){
          var attr=local.key(i);
          var value=JSON.parse(local[attr]);
          console.log(value.sign);
          if(value&&value.sign=='productLocal'){
            //这个条件成立说明是我们需要的local
            li+='<li data-id='+value.id+'>'+
            '<a href="#" class="img"><img src="'+value.img+'"/></a>'+
                '<div class="message">'+
                '<p><a href="#">'+value.name+'</a></p>'+
                '<p>'+value.spec+'x'+value.num+'</p>'+
            '</div>'+
            '<div class="price">¥'+value.price+'.00</div>'+
            '<div class="close">X</div>'+
                '</li>';
            totalPrice+=parseFloat(value.price)*value.num;
          }
        }
        ul.innerHTML=li;
        productNum=ul.children.length;

        yx.g('.carWrap i').innerHTML=productNum;//商品数量的值
        yx.g('.carWrap .total span').innerHTML='￥'+totalPrice+'.00';
        //删除商品
        var closeBtns=yx.ga('.cart .list .close');

        for(var i=0;i<closeBtns.length;i++){
          closeBtns[i].onclick=function () {
            localStorage.removeItem(this.parentNode.getAttribute('data-id'))
            yx.public.shopFn();
            if(ul.children.length==0){
              yx.g('.cart').style.display='none';
            }
          }
        }
        //标识
        var carWrap=yx.g('.carWrap');
        var timer;//购物车与弹出层的间隙


          carWrap.onmouseenter=function () {
            if(ul.children.length>0){
            clearTimeout(timer);
            yx.g('.cart').style.display='block';
            scrollFn();
            }
          };
          carWrap.onmouseleave=function () {
            timer=setTimeout(function () {
              yx.g('.cart').style.display='none';
            },200)
          };




      })(localStorage);
      //购物车滚动条功能

      function  scrollFn() {
        var contentWrap=yx.g('.cart .list');
        var content=yx.g('.cart .list ul');
        var scrollBar=yx.g('.cart .scrollBar');
        var slide=yx.g('.cart .slide');
        var slideWrap=yx.g('.cart .slideWrap');
        var btns=yx.ga('.scrollBar span');
        var timer;
        //倍数
        var beishu=content.offsetHeight/contentWrap.offsetHeight;
        scrollBar.style.display=beishu<=1?'none':'block';
        //给倍数一个最大值
        if(beishu>20){
          beishu=20;
        }
        slide.style.height=slideWrap.offsetHeight/beishu+'px';
        //滑块拖拽
        var scrollTop=0;//滚动条走的距离
        var maxHeight=slideWrap.offsetHeight-slide.offsetHeight;//最大距离
        slide.onmousedown=function (ev) {
          var disY=ev.clientY-slide.offsetTop;
          document.onmousemove=function(ev){
            scrollTop=ev.clientY-disY;
            scroll();
            document.onmouseup=function (ev) {
              this.onmousemove=null;
            };
            ev.cancelBubble=true;
            return false;
          };
        };
          //滚轮滚动的功能
          myScroll(contentWrap,function () {

            scrollTop-=10;
            scroll();
            clearInterval(timer);

          },function () {
            scrollTop+=10;
            scroll();
            clearInterval(timer);

          });
          for(var i=0;i<btns.length;i++){
            btns[i].index=i;
            btns[i].onmousedown=function(){
              var n=this.index;
              timer=setInterval(function () {
                scrollTop=n?scrollTop+5:scrollTop-5;
                scroll();
              },16)
            };
            btns[i].onmouseup=function () {
              clearInterval(timer);
            }
          }
          //滑块区域点击的功能
          slideWrap.onmousedown=function (ev) {
            timer=setInterval(function () {
            var slideTop=slide.getBoundingClientRect().top+slide.offsetHeight/2;
            if(ev.clientY<slideTop){
              //这个条件成立鼠标在上面
              scrollTop-=15;

            }else{
              scrollTop+=15;

            }
            scroll();
            clearInterval(timer);

            },16)
          };

          //滚动条的主体功能
          function scroll() {
            if(scrollTop<0){
              scrollTop=0;
            }else if(scrollTop>maxHeight){
              scrollTop=maxHeight;
            }
            var scaleY=scrollTop/maxHeight;
            slide.style.top=scrollTop+'px';
            content.style.top=-(content.offsetHeight-contentWrap.offsetHeight)*scaleY+'px';
          }
          //滚轮事件
          function myScroll(obj,fnUp,fnDown){
            obj.onmousewheel=fn;
            obj.addEventListener('DOMMouseScroll',fn);
            function fn(ev){
              if(ev.wheelDelta>0||ev.detail<0){

                fnUp.call(obj);
              }else {
                fnDown.call(obj);
              }
              ev.preventDefault();
              return false;
            }
          }

      }
    }
    ,

    //懒加载,滚动条大于图片里html顶部的距离
    lazyImgFn:function(){		//图片懒加载功能
      yx.addEvent(window,'scroll',delayImg);
      delayImg();
      function delayImg(){
        var originals=yx.ga('.original');		//所有要懒加载的图片
        var scrollTop=window.innerHeight+window.pageYOffset;		//这个距离是可视区的高度与滚动条的距离之和

        for(var i=0;i<originals.length;i++){
          //如果图片离html的上边的距离小于滚动条的距离与可视区的距离之和的话，就表示图片已经进入到可视区了
          if(yx.getTopValue(originals[i])<scrollTop){
            originals[i].src=originals[i].getAttribute('data-original');
            originals[i].removeAttribute('class');	//如果这个图片的地址已经换成真实的地址了，那就把它身上的class去掉
          }
        }

        if(originals[originals.length-1].getAttribute('src')!='images/empty.gif'){
          //当这个条件成立的时候，说明现在所有的图片的地址都已经换成真实的地址了，这个时候就不需要再执行这个函数了
          yx.removeEvent(window,'scroll',delayImg);
        }
      }
    },
    //回顶部功能
    backUpFn:function () {
      var back=yx.g('.back');
      var timer;
      back.onclick=function () {
        var top=window.pageYOffset;
        timer=setInterval(function () {
          top-=150;
          if(top<=0){
            top=0;
            clearInterval(timer);
          }
          window.scrollTo(0,top);
        },16)
      }
    }

  }
};

/*
shopFn(){
  //购物车的滚动条内容
  scrollFn();
  function scrollFn(){
    var contentWrap=yx.g('#cart .list');
    var content=yx.g('.cart .list ul');
    var scrollBar=yx.g('.cart .scrollBar');
    var slide=yx.g('.cart .slide');
    var slideWrap=yx.g('.cart slideWrap');
    var btn=yx.ga('.scrollBar span');
    var timer;
    //倍数
    var beishu=content.offsetHeight/contentWrap.offsetHeight;

    scrollBar.style.display=beishu<=1?'none':'block';
    if(beishu>20){
      beishu=20;
    }
    slide.style.height=slideWrap.offsetHeight/beishu+'px';
    //滑块拖拽
    var scrollTop=0;
    var maxHeight=slideWrap.offsetHeight-slide.offsetHeight;

    slide.onmousedown=function (ev) {
      var disY=ev.clientY-slide.offsetTop;
      document.onmousemove=function (ev) {
        scrollTop=ev.clientY-disY;
        scroll();
      };
      document.onmouseup=function () {
        this.onmousemove=null;
      };
      ev.cancelBubble=true;
      return false;
    }

  }

},
*/

























