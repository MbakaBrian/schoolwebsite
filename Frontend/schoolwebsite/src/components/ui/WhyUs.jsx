import React from "react";
import {
  GraduationCap,
  Building2,
  Users,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const reasons = [
  {
    icon: GraduationCap,
    title: "A Holistic, Modern & Competency-Based Education",
    description:
      "We deliver the full Competency-Based Curriculum (CBC) from Reception to Grade 12, combining strong academics with creativity, digital literacy, sports and co-curriculars. Every learner is nurtured to become well-rounded, confident and competent — prepared for today’s world and tomorrow’s opportunities.",
  },
  {
    icon: Building2,
    title: "Excellent Learning & Boarding Facilities",
    description:
      "Our school features modern digital classrooms, well-equipped science labs, a spacious library, ICT facilities, sports grounds and creative arts spaces. Boarding learners enjoy safe dormitories, caring matrons, on-site nurses and structured routines that support academic focus and personal growth.",
  },
  {
    icon: Users,
    title: "Personalised Attention in a Warm School Community",
    description:
      "With a manageable school size and family-oriented culture, every learner receives individual attention and close mentorship. We maintain an open, collaborative relationship with parents, ensuring each child is supported holistically.",
  },
  {
    icon: HeartHandshake,
    title: "A Heart for Supporting Needy but Talented Learners",
    description:
      "Peppercorn is committed to uplifting the community. Each year, we sponsor five bright but needy students, supporting them through secondary school and guiding them toward university and future careers.",
  },
  {
    icon: ShieldCheck,
    title: "Strong, Experienced & Visionary Leadership",
    description:
      "Our leadership team includes seasoned educators and professionals in ICT, school management, architecture and curriculum delivery, driving excellence, discipline, innovation and a strong school culture.",
  },
  {
    icon: Sparkles,
    title: "More Than School — A Place Where Learners Thrive",
    description:
      "Many schools simply teach. At Peppercorn, we inspire. We nurture character, strengthen values, encourage creativity and ensure every learner feels safe, valued and motivated to reach their full potential.",
  },
];

function WhyUs() {
  return (
    <section className="bg-gradient-to-br from-purple-700 via-purple-600 to-red-600 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Why Choose Peppercorn Premier Schools
          </h2>
          <p className="text-white/90 max-w-3xl mx-auto text-lg">
            More than education — we nurture potential, character and excellence
            in every learner.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-1 transition duration-300"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-red-600 text-white mb-5">
                  <Icon size={28} />
                </div>

                <h3 className="text-xl font-bold text-purple-700 mb-3">
                  {item.title}
                </h3>

                <p className="text-gray-700 leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyUs;
