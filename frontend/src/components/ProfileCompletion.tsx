import { useState } from 'react';
import axios from 'axios';
import { User, Loader2 } from 'lucide-react';

const CORE_API_URL = 'http://localhost:3000/api/v1';

interface ProfileCompletionProps {
  user: any;
  token: string;
  onComplete: (updatedUser: any) => void;
}

export default function ProfileCompletion({ user, token, onComplete }: ProfileCompletionProps) {
  const [name, setName] = useState(user.name || '');
  const [age, setAge] = useState(user.age?.toString() || '');
  const [gender, setGender] = useState(user.gender || '');
  const [city, setCity] = useState(user.city || '');
  const [role, setRole] = useState(user.role === 'helper' ? 'helper' : 'varkari');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.patch(
        `${CORE_API_URL}/auth/profile`,
        {
          name: name.trim(),
          age: age ? parseInt(age) : undefined,
          gender: gender || undefined,
          city: city.trim() || undefined,
          role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = res.data.user;
      localStorage.setItem('visava_user', JSON.stringify(updatedUser));
      onComplete(updatedUser);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-completion">
      <div className="profile-completion-bg" />
      <div className="profile-completion-content">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <User size={40} />
            )}
          </div>
          <h2>Complete Your Profile</h2>
          <p>Tell us a bit about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="profile-error">{error}</div>}

          <div className="profile-form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="profile-form-row">
            <div className="profile-form-group">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
                min="1"
                max="150"
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="profile-form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Your city"
            />
          </div>

          <div className="profile-form-group">
            <label>I am a *</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${role === 'varkari' ? 'active' : ''}`}
                onClick={() => setRole('varkari')}
              >
                <span className="role-icon">🚶</span>
                <span className="role-label">Warkari</span>
                <span className="role-desc">On the sacred journey</span>
              </button>
              <button
                type="button"
                className={`role-option ${role === 'helper' ? 'active' : ''}`}
                onClick={() => setRole('helper')}
              >
                <span className="role-icon">🤝</span>
                <span className="role-label">Helper</span>
                <span className="role-desc">Supporting pilgrims</span>
              </button>
            </div>
          </div>

          <button type="submit" className="profile-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" size={18} />
                Saving...
              </>
            ) : (
              'Complete Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
