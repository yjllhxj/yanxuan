//公用方法调用
yx.public.navFn();
yx.public.backUpFn();
//解析url
var params=yx.parseUrl(window.location.href);
var pageId=params.id;//产品id
var curData=productList[pageId];//产品数据
if(!pageId||!curData){
  //404条件
  window.location.href='404.html';
}
//面包屑的功能
var positionFn=yx.g('#position');
positionFn.innerHTML='<a href="#">首页</a> > ';
for(var i=0;i<curData.categoryList.length;i++){
  positionFn.innerHTML+='<a href="#">'+curData.categoryList[i].name+'</a> >';
}
positionFn.innerHTML+=curData.name;

//产品切换
(function () {
  var bigImg=yx.g('#productImg .left img');
  var smallImgs=yx.ga('#productImg .smallImg img');
  bigImg.src=smallImgs[0].src=curData.primaryPicUrl;
  var last=smallImgs[0];
  for(var i=0;i<smallImgs.length;i++){
    if(i){//后四张图片
      smallImgs[i].src=curData.itemDetail['picUrl'+i];
    }
    smallImgs[i].index=i;
    smallImgs[i].onmouseover=function () {
      bigImg.src=this.src;
      last.className='';
      this.className='active';
      last=this;
    }
  }
  //右边
  yx.g('#productImg .info h2').innerHTML=curData.name;
  yx.g('#productImg .info p').innerHTML=curData.simpleDesc;
  yx.g('#productImg .info .price').innerHTML='<div><span>售价</span><strong>￥'+curData.retailPrice+'.00</strong></div>' +
      '<div><span>促销</span><a href="'+curData.hdrkDetailVOList[0].huodongUrlPc+'" class="tag">'
      +curData.hdrkDetailVOList[0].activityType+'</a><a href="'+curData.hdrkDetailVOList[0].huodongUrlPc+
      '" class="discount">领全场满减券，额外机会包裹翻倍</a></div> <div><span>服务</span><a href="#" class="service">' +
      '<i></i>30天无忧退货<i></i>48小时快速退款<i></i>满88元免邮费<i></i>网易自营</a></div>'

  //创建规格dom
  var format=yx.g('#productImg .fomat');
  var dds=[];//存所有dd标签
  for(var i=0;i<curData.skuSpecList.length;i++){//存产品
    var dl=document.createElement('dl');
    var dt=document.createElement('dt');
    dt.innerHTML=curData.skuSpecList[i].name;
    dl.className='clearFix';
    dl.appendChild(dt);
    for(var j=0;j<curData.skuSpecList[i].skuSpecValueList.length;j++){//存产品类型
      var dd=document.createElement('dd');
      dd.innerHTML=curData.skuSpecList[i].skuSpecValueList[j].value;
      dd.onclick=function () {
        changeProduct.call(this);

      };
      dds.push(dd);

      dl.appendChild(dd);
      dd.setAttribute('data-id',curData.skuSpecList[i].skuSpecValueList[j].id);
    }
    format.appendChild(dl);

  }
  //点击规格功能
function changeProduct() {
  if(this.className.indexOf('noclick')!==-1){
    return;
  }
  var curId=this.getAttribute('data-id');//点的id
  var othersDd=[];//对方所有的id标签(操作他们的class)
  var mergeId=[];//与点击的id组合的所有组合
//找对方的dd及组合后的id
  //数据对象里的key是id；id的形式
  for(var attr in curData.skuMap){
    if(attr.indexOf(curId)!=-1){//查找所有有点击id的组合
      var otherId=attr.replace(curId,'').replace(';','');//所有跟点击的id组合的另一个id
      //通过对方的id找到对方的dd
      for(var i=0;i<dds.length;i++){
        if(dds[i].getAttribute('data-id')==otherId){
          othersDd.push(dds[i]);
        }
      }
      mergeId.push(attr);
    }
  }
  //点击功能
    var brothers=this.parentNode.querySelectorAll('dd');//兄弟节点
  if(this.className=='active'){
    console.log(this.className);
    //选中状态
    this.setAttribute('class','');
    for(var i=0;i<othersDd.length;i++){
      if(othersDd[i].className=='noclick'){
        othersDd[i].className='';
      }
    }
  }else{
      //未选中状态
    for(var i=0;i<brothers.length;i++){
      if(brothers[i].className=='active'){

        brothers[i].className='';
      }
    }
    this.className='active';
    for(var i=0;i<othersDd.length;i++){
      if(othersDd[i].className=='noclick'){
        othersDd[i].className='';
      }
      if(curData.skuMap[mergeId[i]].sellVolume==0){
        othersDd[i].className='noclick';
      }
    }
  }
  addNum();
}
//加减功能
function addNum() {
  var actives=yx.ga('#productImg .fomat .active');
  var btnParent=yx.g('#productImg .number div');
  var btns=btnParent.children;
  var ln=yx.ga('#productImg .fomat dl').length;
  //是否打开加减功能
  if(actives.length==ln){
    btnParent.className='';
  }else {
    btnParent.className='noClick';
  }
//减号
  btns[0].onclick=function () {
    if (btnParent.className){
      return;
    }
    btns[1].value--;
    if(btns[1].value<0){
      btns[1].value=0;
    }
  };
  btns[1].onfocus=function () {
    if(btnParent.className){
      this.blur();
    }
  };
  btns[2].onclick=function () {
    if (btnParent.className){
      return;
    }
    btns[1].value++;

  }
}
})();
//加入购物车
(function () {
  yx.public.shopFn();
  var joinBtn=yx.g('#productImg .join');
  joinBtn.onclick=function () {
    var actives=yx.ga('.fomat .active');

    var selectNum=yx.g('#productImg .number input').value;
    if(actives.length<curData.skuSpecList.length||selectNum<1){
      alert('请选择正确的规格跟数量');
      return;
    }
    var id='';//用拼接的id作为key
    var spec=[];//放的是规格，规格有多个，放数组
    for(var i=0;i<actives.length;i++){
      id+=actives[i].getAttribute('data-id')+';';
      spec.push(actives[i].innerHTML);
    }
    id=id.substring(0,id.length-1);
    var select={
      "id":id,
      "name":curData.name,
      "price":curData.retailPrice,
      "num":selectNum,
      "img":curData.skuMap[id].picUrl,
      "sign":"productLocal",//给自己的local取一个标识，避免取到其他人的local
      "spec":spec
    };
    //声明的对象存到local
    localStorage.setItem(id,JSON.stringify(select));
    yx.public.shopFn();
    var carWrap=yx.g('.carWrap');
    carWrap.onmouseenter();
    setTimeout(function () {
      yx.g('.cart').style.display='none';
    },2000)

  }
})();

(function(){//大家都在看
  var ul=yx.g('#look ul');
  var str='';
  for(var i=0;i<recommendData.length;i++){
    str+='<li>'+
            '<a href="#"><img src="'+recommendData[i].listPicUrl+'" alt=""></a>'+
        '<a href="#">'+recommendData[i].name+'</a>'+
        '<span>￥'+recommendData[i].retailPrice+'</span>'

  }
  ul.innerHTML=str;
})();
var allLook=new Carousel();
allLook.init({
  id:'allLook',
  autoplay:false,
  intervalTime:3000,
  loop:false,
  totalNum:8,
  moveNum:4,
  circle:false,
  moveWay:'position'
});
allLook.on('rightEnd',function () {

  this.nextBtn.style.background='#e7e2d7';
});
allLook.on('leftEnd',function () {
  this.prevBtn.style.background='#e7e2d7';

});
allLook.on('leftClick',function () {
  this.nextBtn.style.background='#d0c4af';
});
allLook.on('rightClick',function () {
  this.prevBtn.style.background='#d0c4af';
});
//详情与评价
(function () {
  var as=yx.ga('#bottom .title a');
  var tabs=yx.ga('#bottom .content>div');
  var ln=0;
  for(var i=0;i<as.length;i++){
    as[i].index=i;
    as[i].onclick=function () {
      as[ln].className='';
      tabs[ln].style.display='none';
      this.className='active';
      tabs[this.index].style.display='block';
      ln=this.index;
    }
  }
  //详情
  var tbody=yx.g('.details tbody');
  for(var i=0;i<curData.attrList.length;i++){
    //对象中有两个数据，一次创建2个td
    //tr有4个td，两次创建一个tr
    if(i%2==0){
      var tr=document.createElement('tr')
    }
    var td1=document.createElement('td');
    td1.innerHTML=curData.attrList[i].attrName;
    var td2=document.createElement('td');
    td2.innerHTML=curData.attrList[i].attrValue;
    tr.appendChild(td1);
    tr.appendChild(td2);
    tbody.appendChild(tr);
  }
var img=yx.g('.details .img');
  img.innerHTML=curData.itemDetail.detailHtml;
})();
//评价
(function () {

  var evaluateNum=commentData[pageId].data.result.length;//评价的数量
  var evaluateText=evaluateNum>1000?'999+':evaluateNum;

  yx.ga('#bottom .title a')[1].innerHTML='评价<span>('+evaluateText+')</span>';


  var allData=[[],[]];//第一个全部评价，第二个有图评价
  for(var i=0;i<evaluateNum;i++){
    allData[0].push(commentData[pageId].data.result[i]);
    if(commentData[pageId].data.result[i].picList.length){
      allData[1].push(commentData[pageId].data.result[i])
    }
  }
  yx.ga('#bottom .eTitle span')[0].innerHTML='全部('+allData[0].length+')';
  yx.ga('#bottom .eTitle span')[1].innerHTML='全部('+allData[1].length+')';
  var curData=allData[0];//当前显示的数据
  var btns=yx.ga('#bottom .eTitle div');
  var ln=0;
  for(var i=0;i<btns.length;i++){
    btns[i].index=i;
    btns[i].onclick=function () {

      btns[ln].className='';
      this.className='active';
      ln=this.index;
      curData=allData[this.index];
      showComment(10,0);
      createPage(10,curData.length);
    }
  }
  //显示评价数据
  showComment(10,0);
  function showComment(pn,cn) {//pn一页显示几条,cn现在的页码
    var ul=yx.g('#bottom .border>ul');
    var dataStart=pn*cn;//数据起始的值
    var dataEnd=dataStart+pn;//数据结束的值
    if(dataEnd>curData.length){
      dataEnd=curData.length;
    }
//主题结构
    var str='';
    ul.innerHTML='';
    for(var i=dataStart;i<dataEnd;i++){
      var avatart=curData[i].frontUserAvatar?curData[i].frontUserAvatar:'images/avatar.png';
      var smallImg='';//小图父级
      var dialog='';//轮播图父级
      if(curData[i].picList.length){
        var span='';//小图片父级
        var li='';//图片父级
        for(var j=0;j<curData[i].picList.length;j++){
          span+='<span><img src="'+curData[i].picList[j]+'" alt=""></span>'
          li+='<li><img src="'+curData[i].picList[j]+'" alt="" /></li>'
        }
        smallImg='<div class="smallImg clearfix">'+span+'</div>';
        dialog='<div class="dialog" id="commmetImg'+i+'" data-imgnum="'+curData[i].picList.length+'"><div class="carouselImgCon"><ul>'+li+'</ul></div><div class="close">X</div></div>'
      }
      str+='<li>'+
          '<div class="avatar">'+
          '<img src="'+avatart+'" alt="" />'+
          '<a href="#" class="vip1"></a><span>'+curData[i].frontUserName+'</span>'+
          '</div>'+
          '<div class="text">'+
          '<p>'+curData[i].content+'</p>'+
      smallImg+
          '<div class="color clearfix">'+
          '<span class="left">'+curData[i].skuInfo+'</span>'+
          '<span class="right">'+yx.formatDate(curData[i].createTime)+'</span>'+
      '</div>'+
      dialog+
          '</div>'+
          '</li>'
    }
    ul.innerHTML=str;
    showImg();
  }
  //轮播图
  function showImg() {
    var spans=yx.ga('#bottom .smallImg span');
    for(var i=0;i<spans.length;i++){
      spans[i].onclick=function () {
        var dialog=this.parentNode.parentNode.lastElementChild;
        dialog.style.opacity=1;
        dialog.style.height='510px';
        var en=0;
        dialog.addEventListener('transitionend',function () {
          en++;
          if(en==1){
            var id=this.id;
            var commentImg=new Carousel();
            commentImg.init({
              id:id,
              totalNum:dialog.getAttribute('data-imgnum'),
              autoplay:false,
              loop:false,
              moveNum:1,
              circle:false,
              moveWay:'position'
            });
          }
        });
        var closeBtn=dialog.querySelector('.close');
        closeBtn.onclick=function () {
          dialog.style.opacity=0;
          dialog.style.height=0;
        }
      }
    }
  }
  createPage(10,curData.length);
  function createPage(pn,tn) {
    //pn显示页码的数量
    //tn数据的总数
    var page=yx.g('.page');
    var totalNum=Math.ceil(tn/pn);//最多能显示的页码数量

    //如果用户给的页数比总数还大，就改成总数
    if(pn>totalNum){
      pn=totalNum;
    }
    page.innerHTML='';
    var cn=0;
    var spans=[];//把数字的页码都放在一个数组里，其他地方用的
    var div=document.createElement('div');
    div.className='mainPage';
    //创建首页页码
    var indexPage=pageFn('首页',function () {
      for(var i=0;i<pn;i++){
        spans[i].innerHTML=i+1;
      }
      cn=0;
      showComment(10,cn);
      changePage();

    });
    if(indexPage){//页码小于2是return的是undefined
      indexPage.style.display='none';
    }

    //上一页
    var prevPage=pageFn('<上一页',function () {
      cn--;
      if(cn<0){
        cn=0;
      }
      showComment(10,spans[cn].innerHTML-1);
      changePage();

    });
    if(prevPage){//页码小于2是return的是undefined
      prevPage.style.display='none';
    }

    //创建数字页码
    for(var i=0;i<pn;i++){
      var span=document.createElement('span');
      span.index=i;
      span.innerHTML=i+1;
      spans.push(span);
      span.className=i?'':'active';
      span.onclick=function () {
        cn=this.index;
        showComment(10,cn);
        changePage();

      };
      div.appendChild(span);
    }
    page.appendChild(div);



    //下一页
    var nextPage=pageFn('下一页>',function () {
      if(cn<spans.length-1){
        cn++;
      }
      console.log(cn);
      showComment(10,spans[cn].innerHTML-1);
      changePage();

    });
    //尾页
    var endPage=pageFn('尾页',function () {
      var end=totalNum;
      for(var i=pn-1;i>=0;i--){
        spans[i].innerHTML=end--;
      }
      cn=spans.length-1;

        showComment(10,totalNum-1);
        changePage();
    });
    //更新页码功能
    function changePage() {
      var cur=spans[cn];//当前点击的那个页码
      var curInner=cur.innerHTML;//为10的时候index为0，所以需要keep
      //最后页码减去第一个页码
      var differ=spans[spans.length-1].innerHTML-spans[0].innerHTML;
      //点击的是最后面的页码
      if(cur.index==spans.length-1){
        if(Number(curInner)+differ>totalNum){
          differ=totalNum-curInner;

        }
      }
      //点击的是最前面的页码
      if(cur.index==0){
        if(Number(curInner)-differ<1){
          differ=cur.innerHTML-1;

        }
      }
      /************************************/
      for(var i=0;i<spans.length;i++){
        //点击的是最后面的页码，所有的页码都需要增加
        if(cur.index==spans.length-1){
          spans[i].innerHTML=Number(spans[i].innerHTML)+differ;
        }
        if(cur.index==0){
          spans[i].innerHTML-=differ;
        }
        //设置class
        spans[i].className='';
        if(spans[i].innerHTML==curInner){
          spans[i].className='active';
          cn=spans[i].index;
        }
      }
      //显示与隐藏功能页码（有功能页码才执行）
      if(pn>1){
        var dis=curInner==1?'none':'inline-block';
        indexPage.style.display=dis;
        prevPage.style.display=dis;
        var dis=curInner==totalNum?'none':'inline-block';
        endPage.style.display=dis;
        nextPage.style.display=dis;
      }

    }





    //创建页码的公用函数
    function pageFn(inner,fn) {
      if(pn<2){
        return;
      }
      var span=document.createElement('span');
      span.innerHTML=inner;
      span.onclick=fn;
      page.appendChild(span);
      return span
    }
  }
})();































