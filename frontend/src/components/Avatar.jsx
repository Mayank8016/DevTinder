export default function Avatar({ user, className = 'w-12 h-12' }) {
  if (user?.photoURL)
    return <img src={user.photoURL} alt="" className={`${className} rounded-full object-cover bg-neutral-800`} />;
  return (
    <div className={`${className} rounded-full bg-gradient-to-br from-pink-500 to-orange-400 grid place-items-center font-bold shrink-0`}>
      {user?.firstName?.[0]?.toUpperCase()}
    </div>
  );
}
