const $ =document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY ="mode"
const player=$('.player');
const volumeSet=$('#volumeAdjust')
const volumeIcon=$('.volume .btn-volume')
const activeSong=$('.song.active');
const cd =$('.cd');
const cdProgressFull = $('.cd .circle .mask.full');
const cdProgressFill = $$('.cd .circle .mask .fill');
const heading = $('header marquee');
const cdThumb =$('.cd-thumb');
const repeatBtn = $('.btn-repeat');
const prevBtn = $('.btn-prev');
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const btnMenu=$('.menuBtn');
const randomBtn = $('.btn-random');
const progress= $('#progress');
const progressRange= $('.progressRange')
const audio = $('#audio');
const playlist = $('.playlist');
const endTime=$('.endTime');
const rangeValue=$('.rangeValue');
const startTime =$('.startTime');
const favouriteSongList=$('.favouriteList');
var r = $(':root');
var favouriteArray=[]
const app={
    currentSong: {},
    currentIndex: 0,
    isPlaying :false,
    isMute: false,
    isNext :false,
    isRandom: false,
    isTimeUpdate: true,
    isRepeat :false,
    songTime:0,
    songVolume:0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY ))||{},
    songs: [
        {
            name: 'Last Dance' ,
            singer: 'BIG BANG',
            path: '/Assets/Last Dance - Big Bang.mp3',
            image: '/Assets/lastdance.jpg'

        },
        {
            name: 'What Are Words' ,
            singer: 'Medina',
            path: '/Assets/What are words.mp3',
            image: '/Assets/words.jpg'
        },
       
        {
            name: '2002' ,
            singer: 'Anne Marie',
            path: '/Assets/2002 - Anne Marie.mp3',
            image: '/Assets/2002-anne-marie.jpg'
        },
        {
            name: 'That XX' ,
            singer: 'G-Dragon',
            path: '/Assets/That XX - G-Dragon.mp3',
            image: '/Assets/thatxx.jpg'
        },
       
        {
            name: 'Theo Anh' ,
            singer: 'Ali Hoàng Dương',
            path: '/Assets/Theo Anh - Ali Hoang Duong.mp3',
            image: '/Assets/theoanh.jpg'
        },
        {
            name: 'Theo Anh' ,
            singer: 'Ali Hoàng Dương',
            path: '/Assets/Theo Anh - Ali Hoang Duong.mp3',
            image: '/Assets/theoanh.jpg'
        },
        {
            name: 'To The Moon' ,
            singer: 'Hooligan',
            path: '/Assets/Tothemoon.mp3',
            image: '/Assets/Moon.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    renderSong: function(){
        const htmls =this.songs.map((song,index)=>{
            return `
            <div class="song ${this.currentIndex===index?'active':''}" data-index=${index}>
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option"> 
            <i class="favourite fas fa-heart"></i>
            </div>
            <div class="chose">
            
            
            </div>

          </div>
            `
        });
        playlist.innerHTML=htmls.join('');
 
    },
    handleEvents: function(){
        const _this=this; 
        const cdWidth = cd.offsetWidth;
        const cdHeight =cd.offsetHeight;
        //xử lý CD quay/dừng
        const cdThumbAnimate =cdThumb.animate([
            {transform:'rotate(360deg)'}
        ],
        {
            iterations:Infinity,
            duration:10000 //10s
        })
        cdThumbAnimate.pause();
        //Heading animation
        heading.start();
        // xử lý ảnh phóng to/thu nhỏ CD
        //Scroll view
        document.onscroll = function(){
            var rs=getComputedStyle(r);
            console.log(rs.getPropertyValue('--cd-dim'));
            const scrollTop = window.scrollY||document.documentElement.scrollTop
            const newWidth = cdWidth -scrollTop;
            const scaleRatio=newWidth/cdWidth;
            r.style.setProperty('--cd-dim',newWidth+'px');
            r.style.setProperty('--thumb-dim',Math.floor(newWidth*98/100)+'px');
            r.style.setProperty('--c-width',Math.floor(newWidth*3/100)+'px');
            cd.style.opacity = scaleRatio;
        };     
     //xử lý khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying) {
                audio.pause();
                }
            else {
                audio.play();
                }
            };

        //chọn bài hát tiếp theo
        nextBtn.onclick =function(){
            autoNextSong();
            _this.scrollToActiveSong();
            
        }
        //Previous song on
        //bài hát trước đó
        prevBtn.onclick =function(){
            if(_this.isRandom){
                _this.randomMode();
            }
            else {
                _this.prevSong();
            }
            audio.play();
            _this.scrollToActiveSong();
        };
        
        //Random on
        randomBtn.onclick =function(){
            _this.isRandom=!_this.isRandom;
            _this.setConfig('isRandom',_this.isRandom);
            randomBtn.classList.toggle('active',_this.isRandom);
        };
        //Lặp lại
        repeatBtn.onclick =function(){
            _this.isRepeat=!_this.isRepeat;
            _this.setConfig('isRepeat',_this.isRepeat);
            repeatBtn.classList.toggle('active',_this.isRepeat);
        }
        //Âm lượng
        volumeIcon.onclick =function(){
            audio.volume=0;
            _this.songVolume=audio.volume;
            volumeDisplay();
            volumeIcon.innerHTML='<i class="fas fa-volume-mute"></i>'
        }
        //Auto play next song
        const autoNextSong=()=>{
                if(_this.isRandom)
                     {
                        _this.randomMode();
                    }
                else this.nextSong();
                audio.play();}
        //Handle audio element
        //Load duration instantly 
        audio.onloadeddata = function(){
                _this.songTime=audio.duration.toFixed();
                // _this.songVolume=audio.volume*100; 
                var second=_this.songTime%60;
                endTime.innerHTML =`0${Math.floor(_this.songTime/60)}:${second>9?second:'0'+second}`;
        }
        //khi song được play
        audio.onplay =function(){
            _this.isPlaying = true;        
            player.classList.add('playing');
            cdThumbAnimate.play();
        };
        //khi song bị pause
        audio.onpause =function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        };
        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate =function(){
                if(audio.duration)
                {
                    const currentProgress =Math.floor(audio.currentTime/audio.duration*100);
                    progress.value = currentProgress;
                    const currentMinute = Math.floor(audio.currentTime/60);
                    const currentSecond =Math.floor(audio.currentTime%60)
                    rangeValue.innerHTML =`0${currentMinute}:${currentSecond>9?currentSecond:'0'+currentSecond}`;
                    startTime.innerHTML =`0${currentMinute}:${currentSecond>9?currentSecond:'0'+currentSecond}`;
                     rangeValue.style.left =currentProgress+'%';
                    var color = 'linear-gradient(90deg, rgb(9, 241, 21)' + progress.value + '% , rgb(214, 214, 214)' + progress.value+ '%)';
                    progress.style.background =color;

                    ///cd Thumb complete percent
                    const percent =currentProgress/100*180;
                    console.log(percent)
                    cdProgressFull.style.transform = `rotate(${percent}deg)`;
                    cdProgressFill.forEach(fillElement=>{
                        fillElement.style.transform = `rotate(${percent}deg)`;
                    });
                    
                    
                }
            };
        audio.onended = function(){
            if(_this.isRepeat) 
            {
                audio.play();
            }
            else
            autoNextSong();
        };
        progress.oninput =function(e){
                var x=0;
                x=e.target.value;
                const seekTime = x/100*audio.duration;
                audio.currentTime = seekTime;
                
        };
        progress.onkeydown= function(e){
            if(e.keyCode===39)
            {
                progress.value ++;
            }
        };
        //hành vi click vào playlist
        playlist.onclick= function(e){
            const songNode=e.target.closest('.song:not(.active)');
            const option=e.target.closest('.option');
            const favouriteIndex=Number(e.target.closest('.song').getAttribute('data-index'));          
            
            if(songNode||option)
            {
                
                if(songNode&&!option){
                    const index=songNode.getAttribute('data-index');
                    _this.currentIndex=Number(index);
                    _this.loadAndSave();
                    audio.play();
                }
                if(option){
                    const addFavourite=favouriteArray.includes(favouriteIndex)     
                    if(!addFavourite) favouriteArray.unshift(favouriteIndex)          
                    else {
                        deleteIndex=favouriteArray.indexOf(favouriteIndex)
                        favouriteArray.splice(deleteIndex,1)   
                    }
                    _this.setConfig('favouriteList',favouriteArray)
                    _this.favouriteSave();
                    
                }
            }
        };
        function volumeDisplay(){
            volumeSet.value=_this.songVolume;
            var volumeColor='linear-gradient(90deg, rgb(75, 36, 173)' +_this.songVolume+'%, rgb(214, 214, 214) '+_this.songVolume+'%)';
            volumeSet.style.background=volumeColor;
        };
        //điều chỉnh âm lượng
        volumeSet.oninput= function(e){
            _this.songVolume=e.target.value;
            audio.volume=_this.songVolume/100;
            volumeDisplay();
            _this.setConfig("volume",_this.songVolume);
            _this.volumeIconHandle();   
        };

        ///key and mouse handle
        nextBtn.onmousedown = function(){
            nextBtn.classList.add('active');
        };
        nextBtn.onmouseup = function(){
            nextBtn.classList.remove('active');
        };
        prevBtn.onmousedown = function(){
            prevBtn.classList.add('active');
        };
        prevBtn.onmouseup = function(){
            prevBtn.classList.remove('active');
        };
        volumeIcon.onmousedown =function(){
            volumeIcon.classList.add('active');
        }
        volumeIcon.onmouseup =function(){
            volumeIcon.classList.remove('active');
        }

            
        //progress.addEventListener('input',function(){

        //})
        

    },
    loadCurrentSong: function(){
        this.currentSong=this.songs[this.currentIndex];
        heading.textContent =this.currentSong.name +' - '+this.currentSong.singer;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src =this.currentSong.path;
        
    },
    loadAndSave: function(){
        this.setConfig("currentIndex",this.currentIndex);
        this.loadCurrentSong();
        this.renderSong();
        this.favouriteSave();
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex>=this.songs.length) 
        {
            this.currentIndex=0;
        }
        this.loadAndSave();

    },
    prevSong: function(){
        this.currentIndex -=1;
        if(this.currentIndex<0) 
        {
            this.currentIndex=this.songs.length-1;
        }
        this.loadAndSave();
    },
    randomMode: function(){
        let newIndex;
        do {
            newIndex=Math.floor(Math.random()*this.songs.length)
        }
        while(newIndex===this.currentIndex)
       this.currentIndex=newIndex;
       this.loadAndSave();
    },
    scrollToActiveSong: function(){
        var view='';
        if(this.currentIndex<2) view='end';
        else view='nearest';
        setTimeout(() => {
            $('.song.active').scrollIntoView({
              behavior: "smooth",
              block: view
            });
          }, 300);
        
    },
    volumeIconHandle: function(){
        const volume=this.songVolume;  
        if(volume>50) volumeIcon.innerHTML='<i class="fas fa-volume-up"></i>'
        else {
            if(volume>=5&&volume<=50) volumeIcon.innerHTML='<i class="fas fa-volume-down"></i>'
            else volumeIcon.innerHTML='<i class="fas fa-volume-mute"></i>'
        }     
        
    },
    volumeLoad: function(){
        ///Volume 
        this.songVolume=this.config.volume;
        volumeSet.value=this.songVolume;
        var volumeColor='linear-gradient(90deg, rgb(75, 36, 173)' +this.songVolume+'%, rgb(214, 214, 214) '+this.songVolume+'%)';
        volumeSet.style.background=volumeColor;   
        //Icon
        this.volumeIconHandle();
       
    },
    reloadHandle: function(){ 
        //First load
        if(this.config.currentIndex===undefined)
        {
            this.currentIndex=0;
            this.config.volume=100;
            
            
        }
        else {
            this.currentIndex = this.config.currentIndex;
            this.isRandom=this.config.isRandom;
            this.isRepeat=this.config.isRepeat;
            
            
        }
        if(favouriteArray===undefined) {
            this.config.favouriteList =[];
            favouriteArray =this.config.favouriteList;
        }

        else 
        {
            favouriteArray= this.config.favouriteList;
        }   
            
        randomBtn.classList.toggle('active',this.isRandom);
        repeatBtn.classList.toggle('active',this.isRepeat);
    },
    favouriteSave:function(){ 
        if(favouriteArray!=undefined)
        {
            favouriteArray=this.config.favouriteList;
            const tempIndexArray=[];
            this.songs.map((song,index)=>{
                tempIndexArray.push(index)
            });

                    let difference = tempIndexArray.filter(x => !favouriteArray.includes(x));
                    favouriteArray.map(favIndex=>{
                
                                const favouriteSong=$(`[data-index=\'${favIndex}\'] .favourite`)
                                favouriteSong.classList.add('active');    

                    });
                    difference.map(favIndex=>{
                
                        const favouriteSong=$(`[data-index=\'${favIndex}\'] .favourite`)
                        favouriteSong.classList.remove('active');  
                
        });}
    }
    ,
    favouriteHandle:function(){
        const _this1=this;
        const favHtmls=favouriteArray.map(index=>{
        
                return `<div class='fav' index=${index}>
                <img src='Assets/lovesong.png'>  
                ${this.songs[index].name} - ${this.songs[index].singer}
                </div>`
            
        })
        favouriteSongList.innerHTML=favHtmls.join('');
        const favChoosen=$$('.fav');
        favChoosen.forEach(favSong=>{
            const favSongIndex=Number(favSong.getAttribute('index'))
            favSong.onclick=function(){
                _this1.currentIndex=favSongIndex;
                _this1.loadAndSave();
                audio.play();
            }
        })
    },
    menuHandle: function() {
        
    ////c

        const __this=this;
        btnMenu.onclick=function(){
            __this.favouriteHandle();
            btnMenu.classList.toggle('close');
            if(favouriteArray.length!==0)
                {
                    favouriteSongList.classList.toggle('active');}
        };
        window.onclick=function(event){
            if(!event.target.matches('.menuBtn')&&!event.target.matches('.line')){
                btnMenu.classList.remove('close');
                favouriteSongList.classList.remove('active'); 
            }
        }

    },
    start: function(){
        this.reloadHandle();
        this.volumeLoad();
        this.reloadHandle();
        this.loadAndSave();
        this.handleEvents();
        this.menuHandle();
             
    }
}
app.start();