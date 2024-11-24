var posts=["2024/10/03/Hello World Again!/","2024/10/08/Ubuntu调控CPU频率/","2024/10/30/arxiv论文趋势统计工具/","2024/10/04/minGRU选读/","2024/10/17/一些捕风捉影/","2024/10/15/太虚幻梦/","2024/10/16/想去海边/","2024/10/03/音频识别-从MLP到GRU：作业引发的血案/","2024/11/24/一些小总结/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };