import { Link } from "react-router-dom";
import { Calendar, Clock3, MapPin, Heart } from "lucide-react";

type EventCardProps = {
  title: string;
  date: string;
  location: string;
  slug: string;
};

function EventCard({ title, date, location, slug }: EventCardProps) {
  return (
    <article className="group overflow-hidden rounded-[8px] border border-violet-500/70 bg-[#05050d] text-white shadow-[0_0_35px_rgba(139,92,246,0.28)]">
      <div className="relative h-64 bg-gradient-to-br from-zinc-700 to-zinc-900">
<div
  className="
    absolute
    left-5
    top-5
    h-8
    w-[90px]
    flex
    items-center
    justify-center
    rounded-md
    bg-violet-600
    text-[10px]
    font-bold
    uppercase
    tracking-[0.12em]
    text-white
  "
>
  UPCOMING
</div>

        <button className="absolute right-5 top-5 transition hover:scale-110">
          <Heart size={30} strokeWidth={1.8} className="text-gray-300" />
        </button>
      </div>

      <div className="px-5 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[5px] text-violet-400">
          Event
        </p>

        <h2 className="mt-2 text-3xl font-black leading-tight">{title}</h2>

        <p className="mt-1 text-lg text-gray-400">Koh Phangan</p>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-violet-400" />
            <span>{date}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock3 size={18} className="text-violet-400" />
            <span>4:00 PM - 6:00 AM</span>
          </div>

          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-violet-400" />
            <span>{location}</span>
          </div>
        </div>

        <p className="mt-4 leading-7 text-gray-400">
          The original and biggest Full Moon Party. Dance beneath the stars with
          world-class DJs, incredible visuals, and the unforgettable atmosphere
          of Koh Phangan.
        </p>
      </div>

      <Link
  to={`/events/${slug}`}
  className="
    mx-5
    mt-6
    flex
    h-12
    items-center
    justify-center
    rounded-xl
    bg-gradient-to-r
    from-violet-700
    to-violet-500
    text-sm
    font-bold
    uppercase
    tracking-wide
    text-white
    shadow-lg
    transition
    hover:brightness-110
  "
>
  <span>View Event</span>

  <span className="ml-3 text-lg">→</span>
</Link>
    </article>
  );
}

export default EventCard;