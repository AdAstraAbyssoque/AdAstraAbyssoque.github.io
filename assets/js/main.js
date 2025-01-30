// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// Active nav link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if(pageYOffset >= sectionTop - 180) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(li => {
        li.classList.remove('active');
        if(li.getAttribute('href').slice(1) === current) {
            li.classList.add('active');
        }
    });
});

// Add scroll animation for education and experience items
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.education-item, .experience-item');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);

// Add hover effect for skill items
document.querySelectorAll('.skill-item').forEach(item => {
    item.addEventListener('mouseover', function() {
        this.style.background = 'var(--bg-sidebar-hover)';
    });
    
    item.addEventListener('mouseout', function() {
        this.style.background = 'var(--bg-white)';
    });
});

// 自动生成导航栏
function generateNavigation() {
    const sections = document.querySelectorAll('.section');
    const navList = document.querySelector('.navbar-nav');
    if (!navList) return;
    
    navList.innerHTML = ''; // 清空现有导航

    sections.forEach(section => {
        if (section.id && section.querySelector('.section-title')) {
            const title = section.querySelector('.section-title').textContent;
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `<a class="nav-link" href="#${section.id}">${title}</a>`;
            navList.appendChild(li);
        }
    });
}

// 页面加载完成后生成导航
document.addEventListener('DOMContentLoaded', generateNavigation);

// 添加访问统计初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查并显示访问统计
    setTimeout(() => {
        const elements = document.querySelectorAll('.visitor-count');
        elements.forEach(element => {
            if (element.textContent === '0') {
                element.textContent = '...';
            }
        });
    }, 1000);
});

// 添加访问统计加载失败处理
window.addEventListener('load', function() {
    setTimeout(() => {
        const elements = document.querySelectorAll('.visitor-count');
        elements.forEach(element => {
            if (element.textContent === '...' || element.textContent === '0') {
                element.textContent = '-';
            }
        });
    }, 3000);
});
