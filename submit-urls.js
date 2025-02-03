async function submitToIndexNow() {
  const data = {
    host: "adastraabyssoque.github.io",
    key: "6f60439d7d5c48168e3dd273561fa5f2",
    keyLocation: "https://adastraabyssoque.github.io/6f60439d7d5c48168e3dd273561fa5f2.txt",
    urlList: [
      "https://adastraabyssoque.github.io/",
      "https://adastraabyssoque.github.io/index.html",
      // 添加其他需要提交的URL
    ]
  };

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('IndexNow submission result:', result);
    
    if(response.status === 200) {
      console.log('URLs successfully submitted to IndexNow');
    } else {
      console.error('Error submitting URLs:', response.status, result);
    }
  } catch (error) {
    console.error('Failed to submit URLs:', error);
  }
}

// 当页面发生重要更新时调用此函数
submitToIndexNow();
