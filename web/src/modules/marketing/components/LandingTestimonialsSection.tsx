function LandingTestimonialsSection() {
  const stars = [...Array(5)]

  return (
    <section id="testimonials" className="landing-testimonials">
      <div className="landing-testimonials-container">
        <div className="landing-testimonials-heading">
          <h2 className="landing-section-title">Loved by freelancers and small teams</h2>
          <p className="landing-testimonials-subtitle">
            These are the kinds of reactions <span className="brand-wordmark">Otilor</span> is built for.
          </p>
        </div>

        <div className="landing-testimonials-grid">
          <article className="landing-testimonial">
            <div className="landing-testimonial-stars">
              {stars.map((_, index) => (
                <svg key={index} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p>
              "Before <span className="brand-wordmark">Otilor</span>, my invoice process was one WhatsApp message and one prayer. Now it looks
              sharp and clients pay without stories."
            </p>
            <div className="landing-testimonial-footer">
              <div className="landing-testimonial-avatar">TA</div>
              <div className="landing-testimonial-author">
                <strong>Tolu Adebayo</strong>
                <span>Brand Designer</span>
              </div>
            </div>
          </article>

          <article className="landing-testimonial">
            <div className="landing-testimonial-stars">
              {stars.map((_, index) => (
                <svg key={index} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p>"I used to open calculator, notes, and one random spreadsheet like I was writing WAEC. Now I just send the invoice and rest."</p>
            <div className="landing-testimonial-footer">
              <div className="landing-testimonial-avatar">CO</div>
              <div className="landing-testimonial-author">
                <strong>Chinedu Okafor</strong>
                <span>Developer</span>
              </div>
            </div>
          </article>

          <article className="landing-testimonial">
            <div className="landing-testimonial-stars">
              {stars.map((_, index) => (
                <svg key={index} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p>"The preview saved me from pricing a job wrongly. That kind of small embarrassment can spoil your whole day."</p>
            <div className="landing-testimonial-footer">
              <div className="landing-testimonial-avatar">IB</div>
              <div className="landing-testimonial-author">
                <strong>Ifeoma Balogun</strong>
                <span>Consultant</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default LandingTestimonialsSection
