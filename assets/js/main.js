// 页面重定向逻辑
(function() {
    // 获取当前路径
    const path = window.location.pathname;
    
    // 如果不是主页和必要资源，则重定向
    if (path !== '/' && 
        path !== '/index.html' && 
        !path.startsWith('/assets/')) {
        // 将所有路径重定向到新域名的主页
        window.location.href = 'http://www.raincedar.me/';
    }
})();

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

    // 首先添加主题切换器
    const themeSwitcherLi = document.createElement('li');
    themeSwitcherLi.className = 'nav-item dropdown';
    themeSwitcherLi.innerHTML = `
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
            <i class="fas fa-palette"></i>
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
            <li>
                <button class="dropdown-item" data-theme="light">
                    <i class="fas fa-sun me-2"></i>Light
                </button>
            </li>
            <li>
                <button class="dropdown-item" data-theme="dark">
                    <i class="fas fa-moon me-2"></i>Dark
                </button>
            </li>
            <li>
                <button class="dropdown-item" data-theme="auto">
                    <i class="fas fa-circle-half-stroke me-2"></i>Auto
                </button>
            </li>
        </ul>
    `;
    navList.appendChild(themeSwitcherLi);

    // 然后添加其他导航项
    sections.forEach(section => {
        if (section.id && section.querySelector('.section-title')) {
            const title = section.querySelector('.section-title').textContent;
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `<a class="nav-link" href="#${section.id}">${title}</a>`;
            navList.appendChild(li);
        }
    });

    // 初始化主题切换功能
    initThemeSwitcher();
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

// Theme switcher
function initThemeSwitcher() {
    const theme = localStorage.getItem('theme') || 'auto';
    setTheme(theme);
    
    // 更新下拉菜单中的激活状态
    document.querySelectorAll('[data-theme]').forEach(btn => {
        if(btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => {
            const newTheme = btn.dataset.theme;
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            
            // 更新激活状态
            document.querySelectorAll('[data-theme]').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
    });
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if(localStorage.getItem('theme') === 'auto') {
            setTheme('auto');
        }
    });
}

function setTheme(theme) {
    // 检查浏览器是否支持 View Transitions API
    if (document.startViewTransition) {
        // 使用 View Transitions API 包装主题切换
        document.startViewTransition(() => {
            updateTheme(theme);
        });
    } else {
        // 降级处理：直接切换主题
        updateTheme(theme);
    }
}

function updateTheme(theme) {
    if(theme === 'auto') {
        if(window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

// Initialize theme switcher when DOM is loaded
document.addEventListener('DOMContentLoaded', initThemeSwitcher);
