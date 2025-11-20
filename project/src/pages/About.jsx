import { motion } from 'framer-motion';
import { Leaf, Heart, Users, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pt-24 pb-20 md:pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            About VeggieShop
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Bringing farm-fresh, organic vegetables to your doorstep since 2020
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                At VeggieShop, we believe that everyone deserves access to fresh, organic, and
                sustainably-grown vegetables. Our mission is to connect local farmers directly
                with health-conscious consumers, creating a sustainable food ecosystem that
                benefits everyone.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We work with certified organic farms that follow sustainable farming practices,
                ensuring that every vegetable you receive is not only nutritious but also
                environmentally friendly.
              </p>
            </div>
            <div className="h-64 lg:h-auto">
              <img
                src="https://images.pexels.com/photos/1400172/pexels-photo-1400172.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Fresh vegetables"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: Leaf,
              title: '100% Organic',
              description: 'All our products are certified organic and pesticide-free',
              color: 'from-green-400 to-emerald-500',
            },
            {
              icon: Heart,
              title: 'Grown with Love',
              description: 'Each vegetable is carefully cultivated with passion and care',
              color: 'from-red-400 to-pink-500',
            },
            {
              icon: Users,
              title: 'Community First',
              description: 'Supporting local farmers and building sustainable communities',
              color: 'from-blue-400 to-indigo-500',
            },
            {
              icon: Award,
              title: 'Quality Assured',
              description: 'Rigorous quality checks ensure only the best reach you',
              color: 'from-yellow-400 to-orange-500',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow"
            >
              <div className={`bg-gradient-to-br ${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-xl p-8 md:p-12 text-white mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <p className="text-green-100 text-lg">Happy Customers</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <p className="text-green-100 text-lg">Partner Farms</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <p className="text-green-100 text-lg">Organic Certified</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="h-64 lg:h-auto order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Sustainable farming"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Sustainability First
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                We're committed to reducing our environmental impact through eco-friendly
                packaging, carbon-neutral delivery options, and supporting regenerative
                agriculture practices.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Every purchase you make helps support sustainable farming and contributes
                to a healthier planet for future generations.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
