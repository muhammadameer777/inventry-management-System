import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Search } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { categoryService } from '../../services/categoryService';
import { EventCard } from '../../components/events/EventCard';
import { Button } from '../../components/common/Button';

export const HomePage = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allEvents, allCats] = await Promise.all([
          eventService.getEvents(),
          categoryService.getCategories(),
        ]);
        const featured = allEvents.filter((e) => e.featured);
        setAllEvents(allEvents);
        setFeaturedEvents(featured.length > 0 ? featured.slice(0, 3) : allEvents.slice(0, 3));
        setCategories(allCats);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category !== 'all') params.set('category', category);
    if (date) params.set('date', date);
    navigate(`/events${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const totalSeats = allEvents.reduce(
    (total, event) => total + Math.max(0, (event.capacity || 0) - (event.registeredCount || 0)),
    0
  );
  const heroImage = allEvents[0]?.coverImage
    || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=85&w=2000';

  return (
    <div className="space-y-16 pb-16">
      <section
        className="relative isolate min-h-[580px] overflow-hidden bg-[#0a0a0a] bg-cover bg-center"
        style={{ backgroundImage: `url("${heroImage}")` }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/65 to-black/35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                <span className="h-px w-7 bg-amber-400" />
                Campus life, all in one place
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Make room for <span className="text-amber-400">what’s next.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                Discover workshops, talks, competitions, and the moments that bring campus together.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link to="/events">
                  <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right">
                    Explore events
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="glass" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                    Create an account
                  </Button>
                </Link>
              </div>

              <div className="mt-10 grid max-w-lg grid-cols-3 border-t border-white/15 pt-5 text-left">
                <div>
                  <p className="text-2xl font-bold text-white sm:text-3xl">{loading ? '—' : allEvents.length}</p>
                  <p className="mt-1 text-xs text-white/60 sm:text-sm">Upcoming events</p>
                </div>
                <div className="border-l border-white/15 pl-4 sm:pl-6">
                  <p className="text-2xl font-bold text-white sm:text-3xl">{loading ? '—' : categories.length}</p>
                  <p className="mt-1 text-xs text-white/60 sm:text-sm">Categories</p>
                </div>
                <div className="border-l border-white/15 pl-4 sm:pl-6">
                  <p className="text-2xl font-bold text-amber-400 sm:text-3xl">{loading ? '—' : totalSeats}</p>
                  <p className="mt-1 text-xs text-white/60 sm:text-sm">Places available</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-black/45 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                  <Search size={19} />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Find an event</h2>
                  <p className="text-xs text-white/55">Choose a few details to get started.</p>
                </div>
              </div>

              <label className="mb-1.5 block text-xs font-medium text-white/75" htmlFor="home-event-search">
                Search
              </label>
              <input
                id="home-event-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Event name, topic, or place"
                className="mb-4 h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/15"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/75" htmlFor="home-event-category">
                    Category
                  </label>
                  <select
                    id="home-event-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#171717] px-3 text-sm text-white outline-none focus:border-amber-400/70"
                  >
                    <option value="all">All categories</option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.slug}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/75" htmlFor="home-event-date">
                    Date
                  </label>
                  <input
                    id="home-event-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#171717] px-3 text-sm text-white outline-none focus:border-amber-400/70"
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="mt-5 w-full">
                Search events
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">On campus</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Featured <span className="text-amber-500">events</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Explore upcoming events selected for the campus community.
            </p>
          </div>
          <Link
            to="/events"
            className="flex shrink-0 items-center gap-2 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-500 dark:text-amber-400"
          >
            View all events <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl border border-white/5 bg-[#141414]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((evt, index) => (
              <EventCard key={evt.id} event={evt} featuredLabel={index === 0 ? 'Featured' : undefined} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">Find your crowd</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Explore by <span className="text-amber-500">category</span>
            </h2>
          </div>
          <Link to="/events" className="hidden items-center gap-2 text-sm font-semibold text-amber-500 hover:text-amber-400 sm:flex">
            All events <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/events?category=${cat.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-lg dark:border-white/[0.07] dark:bg-[#141414] dark:hover:shadow-black/30 sm:p-5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-500 transition-colors group-hover:bg-amber-400 group-hover:text-black">
                <Calendar size={18} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-amber-500 dark:text-white">
                {cat.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {cat.description}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Browse <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-[#17130c] to-[#141414] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-500">Have an idea?</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Can’t find the event you’re looking for?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-white/55">
              Send an event suggestion to the campus team.
            </p>
          </div>
          <Link to="/request-event" className="shrink-0">
            <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right">
              Suggest an event
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
