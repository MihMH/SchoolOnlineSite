import { useState } from 'react';
import { useLanguage } from '../../LanguageContext';
import './ContactPage.css';

function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // in real app we'd send to server
    console.log('Contact form submitted', form);
    setSubmitted(true);
  };

  return (
    <div className="contactpage">
      <h1>{t('contactTitle')}</h1>
      {submitted ? (
        <p>{t('thanksMessage')}</p>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            {t('contactName')}
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            {t('contactEmail')}
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            {t('contactMessage')}
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">{t('sendMessage')}</button>
        </form>
      )}
    </div>
  );
}

export default ContactPage;
