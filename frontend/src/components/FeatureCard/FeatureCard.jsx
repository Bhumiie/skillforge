function FeatureCard({ title, description, icon }) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
  
        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
          {icon}
        </div>
  
        <h3 className="text-2xl font-semibold mt-6">
          {title}
        </h3>
  
        <p className="text-gray-600 mt-4 leading-7">
          {description}
        </p>
  
      </div>
    );
  }
  
  export default FeatureCard;