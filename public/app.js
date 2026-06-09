// Custom Cursor Logic
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    cursor.style.backgroundColor = 'rgba(255,255,255,0.2)';
});

document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursor.style.backgroundColor = 'transparent';
});

// Hover effect for links and buttons to expand cursor
const hoverElements = document.querySelectorAll('a, button, .product-card');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.width = '40px';
        cursor.style.height = '40px';
        cursor.style.backgroundColor = 'rgba(255,255,255,0.1)';
        cursor.style.border = '1px solid rgba(255,255,255,0)';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.backgroundColor = 'transparent';
        cursor.style.border = '1px solid rgba(255,255,255,0.5)';
    });
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Scroll Reveal Animations
function reveal() {
    var reveals = document.querySelectorAll(".reveal, .product-card, .about-content");

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
            // If it doesn't have reveal class but is targeted, we add a simple style transition
            if (!reveals[i].classList.contains("reveal")) {
                reveals[i].style.opacity = '1';
                reveals[i].style.transform = 'translateY(0)';
            }
        }
    }
}

// Set initial state for non-reveal classes
document.querySelectorAll('.product-card, .about-content').forEach(el => {
    if (!el.classList.contains('active')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'all 0.8s ease-out';
    }
});

window.addEventListener("scroll", reveal);
// Trigger once on load
reveal();

// Video Autoplay on Scroll (Play once)
const brandVideo = document.querySelector('.brand-video');

if (brandVideo) {
    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                brandVideo.muted = false; // Forzar el sonido activado
                brandVideo.play().catch(err => {
                    console.warn("El navegador bloqueó el autoplay con sonido por políticas de privacidad.", err);
                });
                observer.unobserve(brandVideo); 
            }
        });
    }, {
        threshold: 0.5
    });

    videoObserver.observe(brandVideo);
}

// Parallax Effect for Hero
const heroBg = document.querySelector('.hero-bg');
const heroSection = document.querySelector('.split-hero');

if (heroBg && heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 30;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 30;
        heroBg.style.transform = `translate(${xAxis}px, ${yAxis}px)`;
    });
    
    heroSection.addEventListener('mouseleave', () => {
        heroBg.style.transition = 'transform 0.5s ease-out';
        heroBg.style.transform = `translate(0px, 0px)`;
    });
    
    heroSection.addEventListener('mouseenter', () => {
        heroBg.style.transition = 'none'; // remove transition for smooth tracking
    });
}

// Floating Ash Particles Effect
const createParticles = () => {
    const heroSection = document.querySelector('.split-hero');
    if (!heroSection) return;

    const container = document.createElement('div');
    container.className = 'particles-container';
    heroSection.appendChild(container);

    const particleCount = 35; // Number of particles

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 3 + 1; // 1px to 4px
        const posX = Math.random() * 100; // 0% to 100%
        const delay = Math.random() * 15; // 0s to 15s
        const duration = Math.random() * 10 + 15; // 15s to 25s

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `-${delay}s`; // start immediately at different phases

        container.appendChild(particle);
    }
};

createParticles();

// --- Shopping Cart Logic ---
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const btnPay = document.getElementById('btn-pay');
const checkoutForm = document.getElementById('checkout-form');
const tokenWsInput = document.getElementById('token_ws');

let cart = [];

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">El carrito está vacío</p>';
        btnPay.disabled = true;
        cartTotalPrice.innerText = '$0';
        return;
    }

    cart.forEach((item, index) => {
        total += item.price;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toLocaleString('es-CL')}</p>
            </div>
            <button class="remove-item" data-index="${index}">Quitar</button>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    cartTotalPrice.innerText = '$' + total.toLocaleString('es-CL');
    btnPay.disabled = false;

    // Attach remove events
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.getAttribute('data-index');
            cart.splice(idx, 1);
            updateCartUI();
        });
    });
}

// Add to cart buttons
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        const price = parseInt(btn.getAttribute('data-price'));
        
        cart.push({ name, price });
        updateCartUI();
        cartModal.classList.add('open');
    });
});

// Close cart
if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('open');
    });
}

// Open cart from Navbar
const openCartBtn = document.getElementById('open-cart-btn');
if (openCartBtn) {
    openCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if(cartModal) cartModal.classList.add('open');
    });
}

// Checkout process
if (btnPay) {
    btnPay.addEventListener('click', async () => {
        if (cart.length === 0) return;
        
        btnPay.innerText = 'PROCESANDO...';
        btnPay.disabled = true;

        const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: totalAmount })
            });

            const data = await response.json();

            if (data.ok) {
                // Set action to WebPay URL and token to hidden input, then submit
                checkoutForm.action = data.url;
                tokenWsInput.value = data.token;
                checkoutForm.submit();
            } else {
                alert('Error al iniciar el pago: ' + data.error);
                btnPay.innerText = 'PAGAR CON WEBPAY';
                btnPay.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error de conexión');
            btnPay.innerText = 'PAGAR CON WEBPAY';
            btnPay.disabled = false;
        }
    });
}
