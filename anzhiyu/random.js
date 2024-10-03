var posts=["2024/10/03/hello-world/","2024/10/03/音频识别-从MLP到GRU：作业引发的血案/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };