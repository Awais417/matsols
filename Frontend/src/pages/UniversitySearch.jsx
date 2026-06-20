import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import '../index.css';
import './UniversitySearch.css';

const UniversitySearch = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Fetch data
    const loadUniversities = async () => {
      try {
        const data = await apiService.getUniversities();
        setUniversities(data);
      } catch (err) {
        console.error("Failed to fetch universities:", err);
        setError("Could not load universities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadUniversities();

    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    const countryParam = searchParams.get('country');
    if (countryParam) {
      setActiveFilter(countryParam);
    }
  }, [searchParams]);

  // const universities = [ ... ] removed because we use state now

  const filteredUnis = Array.isArray(universities) ? universities.filter(uni => {
    const normalizedFilter = activeFilter.toLowerCase();
    const countryValue = (uni.country || '').toLowerCase();
    const filterAliases = {
      uk: ["uk", "united kingdom"],
      usa: ["usa", "united states", "united states of america"],
    };
    const aliasList = filterAliases[normalizedFilter];
    const matchesFilter =
      activeFilter === 'All' ||
      (aliasList
        ? aliasList.some((alias) => countryValue.includes(alias))
        : countryValue.includes(normalizedFilter));
    const matchesSearch = (uni.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (uni.country?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }) : [];

  return (
    <div className="export-wrapper">
      <div className="uni-discovery-page">
        <Header />

        <div className="uni-container">
          <div className="uni-header">
            <h1 style={{ fontFamily: 'Playfair Display, serif' }}>Explore World-Class Universities</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', maxWidth: '600px', fontFamily: 'Inter, sans-serif' }}>
              Browse through our portfolio of elite institutional partners and find the perfect match for your academic goals.
            </p>
          </div>

          <div className="uni-layout">
            <aside className="uni-filters">
              <div className="filter-group">
                <h4 style={{ fontFamily: 'Inter, sans-serif' }}>Study Destination</h4>
                <div className="filter-options">
                  {['All', 'UK', 'USA', 'Canada', 'Australia', 'Turkey', 'Malta'].map(dest => (
                    <label key={dest} className="filter-checkbox" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <input
                        type="radio"
                        name="destination"
                        checked={activeFilter === dest}
                        onChange={() => setActiveFilter(dest)}
                      />
                      {dest}
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            <div className="uni-main">
              <div className="search-bar-wrap" style={{ marginBottom: '40px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by University name or city..."
                  className="ai-input"
                  style={{ width: '100%', height: '54px', fontSize: '16px', fontFamily: 'Inter, sans-serif' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <iconify-icon
                  icon="ri:search-2-line"
                  style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '20px' }}
                ></iconify-icon>
              </div>

              <div className="uni-grid">
                {loading ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                    <iconify-icon icon="line-md:loading-twotone-loop" style={{ fontSize: '48px', color: '#06b6d4' }}></iconify-icon>
                    <p style={{ marginTop: '10px' }}>Loading institutional partners...</p>
                  </div>
                ) : error ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                    <iconify-icon icon="ri:error-warning-line" style={{ fontSize: '48px' }}></iconify-icon>
                    <p style={{ marginTop: '10px' }}>{error}</p>
                  </div>
                ) : filteredUnis.map(uni => (
                  <div key={uni.id} className="uni-card">
                    <div className="uni-card-img">
                      <img src={uni.image || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=1080&auto=format&fit=crop'} alt={uni.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className="uni-badge">{uni.status || "Active"} Partner</div>
                    </div>
                    <div className="uni-card-content">
                      <h3 className="uni-name" style={{ fontFamily: 'Playfair Display, serif' }}>{uni.name}</h3>
                      <div className="uni-meta">
                        <div className="uni-meta-item" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <iconify-icon icon="ri:map-pin-2-fill"></iconify-icon>
                          {uni.country}
                        </div>
                        <div className="uni-meta-item" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <iconify-icon icon="ri:graduation-cap-fill"></iconify-icon>
                          University Partner
                        </div>
                      </div>
                      <div className="uni-card-footer">
                        <div className="uni-price" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <iconify-icon icon="ri:medal-line" style={{ color: '#06b6d4' }}></iconify-icon>
                          {uni.rank ? (
                            <>World Rank <span style={{ fontFamily: 'Inter, sans-serif', color: '#06b6d4', fontWeight: '800' }}>#{uni.rank}</span></>
                          ) : (
                            <span style={{ opacity: 0.6 }}>Platinum Partner</span>
                          )}
                        </div>
                        <Link to={`/universities/${uni.id}`} className="btn-apply" style={{ fontFamily: 'Inter, sans-serif', background: '#0f172a', fontWeight: '600' }}>Explore Details</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUnis.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
                  <iconify-icon icon="ri:search-eye-line" style={{ fontSize: '48px', marginBottom: '20px' }}></iconify-icon>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>No universities found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default UniversitySearch;
