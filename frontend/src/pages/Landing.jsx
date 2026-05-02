import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function ReviewsSection() {
  const [data, setData] = useState({ reviews: [], avg_rating: 0, total: 0 });

  useEffect(() => {
    fetch("/api/reviews/public")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, []);

  if (data.reviews.length === 0) return null;

  const Stars = ({ rating }) => (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ color: n <= rating ? "#f59e0b" : "#e5e7eb", fontSize: 14 }}>★</span>
      ))}
    </div>
  );

  return (
    <section style={{ padding: "0 0 90px", background: "#fff" }}>
      <div className="container" style={{ paddingTop: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: "#C8622A", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", marginBottom: 10 }}>CUSTOMER LOVE</p>
          <h2 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 800 }}>
            What They <span style={{ color: "#C8622A" }}>Say</span>
          </h2>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 16 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ color: n <= Math.round(data.avg_rating) ? "#f59e0b" : "#e5e7eb", fontSize: 22 }}>★</span>
              ))}
            </div>
            <span style={{ fontWeight: 800, fontSize: 22, color: "#1d1d1d" }}>{data.avg_rating}</span>
            <span style={{ color: "#999", fontSize: 14 }}>({data.total} reviews)</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {data.reviews.map((review, i) => (
            <div key={i} style={{ background: "#fffaf6", borderRadius: 20, padding: 24, border: "1px solid rgba(200,98,42,0.1)", transition: "all 0.3s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(200,98,42,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              {/* Quote icon */}
              <div style={{ fontSize: 32, color: "#C8622A", opacity: 0.3, lineHeight: 1, marginBottom: 12 }}>"</div>
              {/* Comment */}
              <p style={{ color: "#555", lineHeight: 1.7, fontSize: 14, marginBottom: 20, fontStyle: "italic" }}>
                {review.comment}
              </p>
              {/* User */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#C8622A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {review.user_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#1d1d1d" }}>{review.user_name}</p>
                  <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n} style={{ color: n <= review.food_rating ? "#f59e0b" : "#e5e7eb", fontSize: 13 }}>★</span>
                    ))}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", background: "rgba(200,98,42,0.08)", borderRadius: 10, padding: "4px 10px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#C8622A" }}>{review.food_rating}/5</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeItem, setActiveItem] = useState(0);
  const [hoveredLink, setHoveredLink] = useState(null);

  const menuItems = [
    { name: "Pizza Napoletana", price: "290", desc: "Classic tomato sauce, mozzarella & basil.", tag: "BESTSELLER", img: "/images/food/Pizza Napoletana.jpg" },
    { name: "American Burger",  price: "490", desc: "Double beef patty, cheddar & onions.",      tag: "NEW",        img: "/images/food/American Burger.jpg"  },
    { name: "Pizza Sauna",      price: "350", desc: "Pepperoni, mushrooms & house sauce.",        tag: "CHEF PICK",  img: "/images/food/Pizza Sauna.jpg"      },
    { name: "Crispy Chicken",   price: "420", desc: "Golden crispy chicken with sauce.",          tag: "HOT",        img: "/images/food/Crispy Chicken.jpg"   },
  ];

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMouse = (e) => setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
    window.addEventListener("scroll", onScroll);
    window.addEventListener("mousemove", onMouse);
    const timer = setInterval(() => setActiveItem(p => (p + 1) % menuItems.length), 3000);
    return () => { window.removeEventListener("scroll", onScroll); clearInterval(timer); };
  }, []);

  return (
    <div style={{ background: "#fffaf6", minHeight: "100vh", color: "#1d1d1d", fontFamily: "Poppins, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;scroll-behavior:smooth}
        .container{width:90%;max-width:1300px;margin:auto}

        /* ── NAV LINKS ── */
        .nav-link {
          position: relative;
          text-decoration: none;
          color: #444;
          font-weight: 600;
          font-size: 15px;
          padding: 8px 16px;
          border-radius: 10px;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 16px;
          right: 16px;
          height: 2px;
          background: #C8622A;
          border-radius: 2px;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .nav-link:hover {
          color: #C8622A;
          background: rgba(200,98,42,0.07);
        }
        .nav-link:hover::after { transform: scaleX(1); }

        /* ── BUTTONS ── */
        .btn-main {
          background: #C8622A;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-family: Poppins, sans-serif;
          font-size: 15px;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-main:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(200,98,42,.3);
          background: #b5581f;
        }
        .btn-outline {
          border: 2px solid #C8622A;
          background: white;
          color: #C8622A;
          padding: 14px 28px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-family: Poppins, sans-serif;
          font-size: 15px;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-outline:hover { background: #C8622A; color: white; transform: translateY(-3px); }

        /* ── MENU CARDS ── */
        .menu-card {
          background: white;
          border-radius: 24px;
          padding: 18px;
          border: 2.5px solid transparent;
          box-shadow: 0 8px 24px rgba(0,0,0,.06);
          transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .menu-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(200,98,42,0.04) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .menu-card:hover {
          transform: translateY(-10px);
          border-color: #C8622A;
          box-shadow: 0 24px 48px rgba(200,98,42,.18);
        }
        .menu-card:hover::before { opacity: 1; }
        .menu-card.active {
          border-color: #C8622A;
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(200,98,42,.2);
        }
        .menu-card.active::before { opacity: 1; }
        .menu-card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 16px;
          margin-bottom: 14px;
          transition: transform 0.4s;
        }
        .menu-card:hover img, .menu-card.active img { transform: scale(1.04); }

        /* Tag */
        .item-tag {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 10px;
        }
        .item-tag.bestseller { background: #fff0e8; color: #C8622A; border: 1px solid rgba(200,98,42,.2); }
        .item-tag.new        { background: #e8f5ff; color: #0077cc; border: 1px solid rgba(0,119,204,.15); }
        .item-tag.chef       { background: #f0ffe8; color: #2a7a00; border: 1px solid rgba(42,122,0,.15); }
        .item-tag.hot        { background: #ffe8e8; color: #cc2200; border: 1px solid rgba(204,34,0,.15); }

        /* Active indicator dot */
        .active-dot {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 10px;
          height: 10px;
          background: #C8622A;
          border-radius: 50%;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100%{transform:scale(1);opacity:1}
          50%{transform:scale(1.5);opacity:0.5}
        }

        /* Floating */
        .floating { animation: float 4s ease-in-out infinite; }
        @keyframes float3d {
          0%,100%{ transform: perspective(900px) rotateY(-12deg) rotateX(6deg) translateY(0px); }
          50%{ transform: perspective(900px) rotateY(-8deg) rotateX(4deg) translateY(-22px); }
        }
        @keyframes float3dBurger {
          0%,100%{ transform: perspective(900px) rotateY(10deg) rotateX(-4deg) translateY(0px); }
          50%{ transform: perspective(900px) rotateY(6deg) rotateX(-2deg) translateY(-16px); }
        }
        @keyframes spin3d {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes particle {
          0%,100%{ transform: translateY(0) scale(1); opacity:0.5; }
          50%{ transform: translateY(-12px) scale(1.3); opacity:0.9; }
        }
        .food-3d { will-change: transform; }
        .floating-2 { animation: float 4s ease-in-out 0.8s infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }

        /* Story card */
        .story-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,.06);
          transition: .4s;
        }
        .story-card:hover { transform: translateY(-6px); }

        @media(max-width:900px){
          .hero-grid,.menu-grid,.story-grid,.contact-grid{grid-template-columns:1fr!important}
          .food-pizza img { width: clamp(150px,60vw,280px) !important; }
          .food-burger img { width: clamp(120px,50vw,220px) !important; }
          .nav-links{display:none!important}
          .menu-grid{grid-template-columns:repeat(2,1fr)!important}
          .hero-grid { padding: 0 16px !important; }
          .hero-3d-area { min-height: 320px !important; }
        }
        @media(max-width:540px){
          .menu-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, width: "100%", zIndex: 999,
        background: scrollY > 20 ? "rgba(255,250,246,.96)" : "rgba(255,250,246,.75)",
        backdropFilter: "blur(14px)",
        borderBottom: scrollY > 20 ? "1px solid rgba(0,0,0,.06)" : "none",
        transition: "all 0.4s",
      }}>
        <div className="container" style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>
            <div style={{ width: 36, height: 36, background: "#C8622A", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ri-restaurant-2-line" style={{ color: "#fff", fontSize: 18 }}></i>
            </div>
            <h2 style={{ color: "#C8622A", fontWeight: 800, fontSize: 20 }}>BRAYIN FOOD</h2>
          </div>

          {/* Nav links */}
          <div className="nav-links" style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <a href="#menu" className="nav-link">
              <i className="ri-restaurant-line" style={{ fontSize: 14 }}></i> Menu
            </a>
            <a href="#story" className="nav-link">
              <i className="ri-book-open-line" style={{ fontSize: 14 }}></i> Story
            </a>
            <a href="#contact" className="nav-link">
              <i className="ri-map-pin-line" style={{ fontSize: 14 }}></i> Contact
            </a>
          </div>

          {/* Auth buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-outline" onClick={() => navigate("/login")} style={{ padding: "10px 20px", fontSize: 14 }}>
              <i className="ri-login-circle-line"></i> Sign In
            </button>
            <button className="btn-main" onClick={() => navigate("/register")} style={{ padding: "10px 20px", fontSize: 14 }}>
              <i className="ri-restaurant-line"></i> Order Now
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 100, paddingBottom: 60 }}>
        <div className="container hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(20px,4vw,60px)", alignItems: "center" }}>
          <div>
            <p style={{ color: "#C8622A", fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 32, height: 2, background: "#C8622A", display: "inline-block" }}></span>
              AUTHENTIC ITALIAN × ALGERIAN SOUL
            </p>
            <h1 style={{ fontSize: "clamp(42px,8vw,78px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 25 }}>
              TIME IS <br /><span style={{ color: "#C8622A" }}>AN INGREDIENT</span>
            </h1>
            <p style={{ color: "#666", lineHeight: 1.8, maxWidth: 520, marginBottom: 35 }}>
              Premium handcrafted meals with fast delivery and unforgettable taste. Every order tracked in real-time.
            </p>
            <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
              <button className="btn-main" onClick={() => navigate("/register")}>
                <i className="ri-user-add-line"></i> Start Ordering
              </button>
              <button className="btn-outline" onClick={() => document.getElementById("menu")?.scrollIntoView({behavior:"smooth"})}>
                <i className="ri-play-circle-line"></i> View Menu
              </button>
            </div>
            {/* Stats */}
            <div style={{ display: "flex", gap: 40, marginTop: 50 }}>
              {[["2K+","Customers"],["50+","Menu Items"],["30min","Delivery"]].map(([n,l]) => (
                <div key={l}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#C8622A" }}>{n}</div>
                  <div style={{ fontSize: 12, color: "#999", fontWeight: 500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", minHeight: 500 }}>
            <div className="floating" style={{ position: "absolute", right: 0, top: 0, background: "white", borderRadius: 24, padding: 16, boxShadow: "0 20px 50px rgba(0,0,0,.1)" }}>
              <img src="/images/food/Pizza Napoletana.jpg" alt="" style={{ width: 300, height: 220, objectFit: "cover", borderRadius: 16 }} onError={e => e.target.src="/images/food/placeholder.jpg"} />
            </div>
            <div className="floating-2" style={{ position: "absolute", left: 0, bottom: 30, background: "white", borderRadius: 24, padding: 16, boxShadow: "0 20px 50px rgba(0,0,0,.1)" }}>
              <img src="/images/food/American Burger.jpg" alt="" style={{ width: 240, height: 180, objectFit: "cover", borderRadius: 16 }} onError={e => e.target.src="/images/food/placeholder.jpg"} />
            </div>
          </div>
        </div>
      </section>

      {/* ── MENU ── */}
      <section id="menu" style={{ padding: "40px 0 90px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: "#C8622A", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", marginBottom: 10 }}>OUR SIGNATURE</p>
            <h2 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 800 }}>
              Our <span style={{ color: "#C8622A" }}>Menu</span>
            </h2>
          </div>

          <div className="menu-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
            {menuItems.map((item, i) => {
              const tagClass = ["bestseller","new","chef","hot"][i];
              return (
                <div key={i} className={`menu-card${activeItem===i?" active":""}`} onClick={() => navigate("/register")}>
                  {activeItem === i && <div className="active-dot" />}
                  <img src={item.img} alt={item.name} onError={e => e.target.src="/images/food/placeholder.jpg"} />
                  <span className={`item-tag ${tagClass}`}>{item.tag}</span>
                  <h3 style={{ marginTop: 8, fontSize: 16, fontWeight: 700 }}>{item.name}</h3>
                  <p style={{ color: "#888", lineHeight: 1.6, marginTop: 6, fontSize: 13 }}>{item.desc}</p>
                  <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color: "#C8622A", fontSize: 20 }}>{item.price} دج</strong>
                    <button className="btn-main" style={{ padding: "8px 16px", fontSize: 13, borderRadius: 10 }} onClick={e => { e.stopPropagation(); navigate("/register"); }}>
                      <i className="ri-add-line"></i> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section id="story" style={{ paddingBottom: 90 }}>
        <div className="container story-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "center" }}>
          <img src="/images/food/Crispy Chicken.jpg" alt="" className="story-card" style={{ width: "100%", height: 450, objectFit: "cover", borderRadius: 24 }} onError={e => e.target.src="/images/food/placeholder.jpg"} />
          <div>
            <p style={{ color: "#C8622A", fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 28, height: 2, background: "#C8622A", display: "inline-block" }}></span>
              OUR STORY
            </p>
            <h2 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, marginBottom: 20 }}>
              Crafted with passion,<br />delivered with speed.
            </h2>
            <p style={{ color: "#666", lineHeight: 1.8, marginBottom: 30 }}>
              Every meal is prepared fresh and delivered in real-time. No shortcuts, no frozen ingredients — just real cooking, real fast. Every order is tracked from kitchen to your door.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-main" onClick={() => navigate("/register")}>
                <i className="ri-user-add-line"></i> Join Us Today
              </button>
              <button className="btn-outline" onClick={() => navigate("/login")}>
                <i className="ri-login-circle-line"></i> Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 20px", textAlign: "center", background: "#fff3ec" }}>
        <p style={{ color: "#C8622A", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", marginBottom: 16 }}>READY?</p>
        <h2 style={{ fontSize: "clamp(36px,7vw,65px)", fontWeight: 800, marginBottom: 32 }}>
          One Bite And <br /><span style={{ color: "#C8622A" }}>You're Hooked</span>
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 15, flexWrap: "wrap" }}>
          <button className="btn-main" onClick={() => navigate("/register")} style={{ fontSize: 16, padding: "16px 36px" }}>
            <i className="ri-user-add-line"></i> Create Account
          </button>
          <button className="btn-outline" onClick={() => navigate("/login")} style={{ fontSize: 16, padding: "16px 36px" }}>
            <i className="ri-login-circle-line"></i> Sign In
          </button>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: "90px 0", background: "#fff" }}>
        <div className="container contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <p style={{ color: "#C8622A", fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 28, height: 2, background: "#C8622A", display: "inline-block" }}></span>
              CONTACT US
            </p>
            <h2 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, marginBottom: 24 }}>Visit Our Location</h2>
            {[["ri-map-pin-line","Guelma, Algeria"],["ri-phone-line","+213 555 55 55 55"],["ri-mail-line","contact@brayinfood.com"]].map(([icon,text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, background: "rgba(200,98,42,.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={icon} style={{ color: "#C8622A", fontSize: 18 }}></i>
                </div>
                <span style={{ color: "#555", fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
          <iframe title="map" src="https://www.google.com/maps?q=Guelma,Algeria&output=embed" width="100%" height="420" style={{ border: 0, borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,.08)" }} />
        </div>
      </section>


      {/* ── REVIEWS ── */}
      <ReviewsSection />

      {/* ── FOOTER ── */}
      <footer style={{ background: "#fff7f1", padding: "40px 20px", borderTop: "1px solid rgba(0,0,0,.05)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#C8622A", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ri-restaurant-2-line" style={{ color: "#fff", fontSize: 16 }}></i>
            </div>
            <div>
              <h3 style={{ color: "#C8622A", fontWeight: 800, fontSize: 16 }}>BRAYIN FOOD</h3>
              <p style={{ color: "#999", fontSize: 12 }}>Premium Taste · Fast Delivery</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <a href="#menu" className="nav-link" style={{ fontSize: 13 }}>Menu</a>
            <a href="#story" className="nav-link" style={{ fontSize: 13 }}>Story</a>
            <a href="#contact" className="nav-link" style={{ fontSize: 13 }}>Contact</a>
          </div>
          <button className="btn-main" onClick={() => window.open("https://www.google.com/maps?q=Guelma,Algeria","_blank")} style={{ fontSize: 14, padding: "10px 20px" }}>
            <i className="ri-map-pin-line"></i> Our Location
          </button>
        </div>
        <p style={{ textAlign: "center", marginTop: 25, color: "#aaa", fontSize: 13 }}>© 2026 BRAYIN FOOD · All rights reserved</p>
      </footer>
    </div>
  );
}

// Note: Reviews section is exported separately - add before footer in Landing.jsx