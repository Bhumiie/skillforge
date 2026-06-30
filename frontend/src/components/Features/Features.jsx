import FeatureCard from "../FeatureCard/FeatureCard";

function Features() {
    return (
      <section id="features-section" className="py-24 bg-white">
  
        <div className="max-w-7xl mx-auto px-8">
  
          <h2 className="text-4xl font-bold text-center">
            Everything You Need to Build Together
          </h2>
  
          <p className="text-gray-600 text-center mt-4">
            Learn, collaborate, and transform your ideas into real-world projects.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <FeatureCard title="Learn Skills" description="Discover new skills from peers and keep growing through collaborative learning." icon="🎯" />
            <FeatureCard
                title="Find Teammates"
                description="Connect with students who complement your skills."
                icon="👥"
                />

                <FeatureCard
                title="Build Projects"
                description="Turn ideas into portfolio-worthy projects."
                icon="🚀"
                />
          </div>
  
        </div>
  
      </section>
    );
  }
  
  export default Features;