var posts=["2024/10/03/Hello World Again!/","2024/10/03/音频识别-从MLP到GRU：作业引发的血案/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };