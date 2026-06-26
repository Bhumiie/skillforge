function Hero() {
    return (
        <section className="min-h-[90vh] flex items-center bg-slate-50">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">
      
          {/* Left */}
      
          <div>
            <h1 className="text-5xl font-bold leading-tight">
              Forge Skills.
              <br />
              Forge Teams.
              <br />
              <span className="text-blue-600">
                Forge the Future.
              </span>
            </h1>
      
            <p className="mt-6 text-lg text-gray-600">
              Exchange skills, connect with like-minded people,
              and build projects that matter.
            </p>
      
            <div className="mt-8 flex gap-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
                Get Started
              </button>
      
              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50">
                Explore
              </button>
            </div>
          </div>
      
          {/* Right */}

            <div className="flex justify-center">
            <div className="w-[450px] bg-white rounded-3xl shadow-xl p-8">

            <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                B
            </div>

                <div>
                    <h2 className="text-xl font-bold">
                    Bhumika
                    </h2>

                    <p className="text-gray-500 text-sm">
                    Computer Science Student
                    </p>
                </div>
                </div>

                <hr className="my-6" />

                <h3 className="font-semibold text-lg">
                My Skills
                </h3>

                <div className="flex flex-wrap gap-3 mt-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    React
                </span>

                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    C++
                </span>

                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    DSA
                </span>
                </div>

                <h3 className="font-semibold text-lg mt-8">
                Currently Learning
                </h3>

                <div className="mt-3">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    Node.js
                </span>
                </div>

                <h3 className="font-semibold text-lg mt-8">
                Looking for
                </h3>

                <div className="mt-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    UI/UX Designer
                </span>
                </div>
                

            </div>
            </div>
      
        </div>
      </section>
    );
  }
  
  export default Hero;