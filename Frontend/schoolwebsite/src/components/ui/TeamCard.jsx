export default function TeamCard({ name, role, image, onViewMore }) {
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">

      {/* PROFILE IMAGE */}
      <div className="w-32 h-32 mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-full border-4 border-red-500 shadow-md"
        />
      </div>

      {/* NAME */}
      <h3 className="text-xl font-bold text-gray-900 text-center">{name}</h3>

      {/* ROLE */}
      <p className="text-red-600 font-semibold mb-3 text-center">{role}</p>

      {/* VIEW MORE BUTTON */}
      <button
        onClick={onViewMore}
        className="text-sm text-red-600 underline hover:text-red-800"
      >
        View More
      </button>
    </div>
  );
}
