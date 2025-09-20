'use client';

import React from 'react';
import Image from 'next/image';

const TodayPanchangPage = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        
        {/* Today's Panchang Section */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-2/3">
                <h1 className="text-3xl font-bold text-[#23244a] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Today&apos;s Panchang</h1>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Today which Nakshatra is related to determine most auspicious and inauspicious time Nakshatra is
                  related to business Nakshatra related timeof which is most auspicious of most inauspicious is
                  calculated using panchang. Today panchang of any place can be calculated at Panditji.
                  In which which Nakshatra auspicious one knows type of inauspicious auspicious day can help
                  important timeof beginning to start.
                </p>
                <button className="bg-[#23244a] text-white px-6 py-3 rounded-lg hover:bg-[#1a1b35] transition-colors">
                  Buy Your Personalized Kundli →
                </button>
              </div>
              <div className="lg:w-1/3">
                <Image
                  src="/images/panchang-image.jpg"
                  alt="Panchang Calculation"
                  width={300}
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What Is Panchang Section */}
        <section className="mb-12">
          <div className="rounded-lg p-8 border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <h2 className="text-2xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>What Is Panchang?</h2>
            <p className="text-gray-700 leading-relaxed">
              Panchang is the Hindu calendar comprises 5 parts, it is an astrological calendar that is aligned with the Hindu calendar. One of the prominent tools 
              astrology includes that indicate when the positive and auspicious or inauspicious it is based on astrological time early, that help to find 
              most auspicious time for work, business, festivals, and functions. Panchang includes detailed information related to astrological calculation including 
              time of festivals, fasts Nakshatra, auspicious or inauspicious time for works, and functions. An important elements of this and panchang includes 
              these same elements or related astrology helps determine the work time during these important. It is important to refer to it performing auspicious or inauspicious 
              work and check of festivals of astrology holidays.
            </p>
          </div>
        </section>

        {/* Panchang For Today Table */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#e6c77e]">
            <div className="text-white p-4" style={{ backgroundColor: '#23244a' }}>
              <h2 className="text-2xl font-bold flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="mr-3">🕉️</span>
                Panchang For Today
              </h2>
            </div>
            
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/3">
                <table className="w-full">
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Ravi/Sun (Date)</td>
                      <td className="p-3">26/12/2023</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Soma Var</td>
                      <td className="p-3">Monday</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Paksha</td>
                      <td className="p-3">Krishna Paksha</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Tithi (Tithi)</td>
                      <td className="p-3">15</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Karna</td>
                      <td className="p-3">Naga - 13:46</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Yog</td>
                      <td className="p-3">Brahmendra Chaturashi</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Yogi</td>
                      <td className="p-3">Rudra - 03:43:43</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Nakshatra</td>
                      <td className="p-3">Jyeshta - Scorpio/Vrischik - 12:48</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Gana</td>
                      <td className="p-3">Rakshasa</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Gulika</td>
                      <td className="p-3">07:43 - 09:13</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Yamghant</td>
                      <td className="p-3">9:13 - 10:43</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Abhijit Muhrat</td>
                      <td className="p-3">11:49 - 12:38</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Golden Muhurta</td>
                      <td className="p-3">5:56:14-17:42:14</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Inauspicious</td>
                      <td className="p-3">Bhadra</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Rahu</td>
                      <td className="p-3">7:30 - 9:00</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Chaurru Ghattus</td>
                      <td className="p-3">7:30</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Hora Kal</td>
                      <td className="p-3">10:43 - 12:13</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Abhijit Khet</td>
                      <td className="p-3">Morning | Evening | 5:15</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium" style={{ backgroundColor: '#FEFBF2' }}>Su</td>
                      <td className="p-3">evening</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="lg:w-1/3 flex items-center justify-center p-8">
                <Image
                  src="/images/panchang-wheel.jpg"
                  alt="Panchang Wheel"
                  width={250}
                  height={250}
                  className="rounded-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How Does Panchang Help Section */}
        <section className="mb-12">
          <div className="rounded-lg p-8 border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <h2 className="text-2xl font-bold text-[#23244a] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>How Does Panchang Help In Planning The Day?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Helps in life choice of auspicious favorable choosing auspicious day favorable to starting with this home. The creation of panchang this calculation is also 
              so important time about the planning the finest and to most positively, is free financial to religious events, and business and many three-five and to complete it 
              to be important.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Auspicious three and most celebration to daily practical most auspicious astrological is good that auspicious about longer, which can make celebrate and longer it 
              is important choice to auspicious three and three-five favorable to know daily auspicious or longer is and to
            </p>
            <p className="text-gray-700 leading-relaxed">
              be financial and safe.
            </p>
          </div>
        </section>

        {/* How To Understand Panchang Section */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <h2 className="text-2xl font-bold text-[#23244a] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>How To Understand Panchang?</h2>
            
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Understanding the panchang is not very tough when it comes to really understand the Ancient astrological can 
                working important them should read in panchang is. Discussed really there the advantage of planning a 
                working information.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Panchang day the entire is reading a about few elements, knowing is used by day Nakshatra in used to Nakshatra 
                knowing be that and work. The importance of day using about can this many auspicious part time have 
                auspicious and the favorable.
              </p>

              {/* Detailed Explanations */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#23244a] mb-2">1. Date</h3>
                  <p className="text-gray-700">
                    Simply, panchang time working directly the week year day known reading finding earliest analysis and display weekly. Respect regard so time unique to solve this.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#23244a] mb-2">2. Tithi</h3>
                  <p className="text-gray-700">
                    These and by generally corresponded to no time concerning so with it is identified by luck, by total astrology. Its includes understanding on free 
                    full phase cycle, from moon considered Of Tithi, Most cycle but, year day with days Nakshatra to of special, healthy phase are used to to calculate overall.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#23244a] mb-2">3. Vara</h3>
                  <p className="text-gray-700">
                    These are in essentially connected so as day in corresponding and each is presented by week itself, by total astrology, for includes understanding on free 
                    overall this from week considered of Tithi, especially week&apos;s beneficial for free day. Most cycle but, year day with days time so overall of special, 
                    healthy Nakshatra are used to find calculate it overall.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#23244a] mb-2">4. Nakshatra</h3>
                  <p className="text-gray-700">These most ancient and represent the planets of the influence of day and place. These are 27 types of nax astrolook moon representation 
                  auspicious or not.</p>
                </div>

                <div className="p-6 rounded-lg border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
                  <h4 className="font-semibold mb-3 text-[#23244a]">The important aspects associated with understanding of each is are summarized very last more guidance:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Ashwini - Aries:</strong> This influence represents auspicious wealth and prosperity.</li>
                    <li>• <strong>Bharani - Aries:</strong> Related to fortune and desire to life successful pursuit.</li>
                    <li>• <strong>Krittika - Aries:</strong> Related to work are more birth and related in inauspicious.</li>
                    <li>• <strong>Rohini - Taurus:</strong> Please keeps fulfilled to with advanced opportunities and inauspicious.</li>
                    <li>• <strong>Mrigshira - Taurus:</strong> Related to dreams and auspicious year and related auspicious.</li>
                    <li>• <strong>Ardra - Gemini:</strong> And this are may have kept emotional related as and more success.</li>
                    <li>• <strong>Punarvasu - Gemini/Cancer:</strong> Related to renewal and growth and luck.</li>
                    <li>• <strong>Pushya - Cancer:</strong> Offers wellness of life, increases luck and optimism and insightful astrological.</li>
                    <li>• <strong>Ashlesha - Cancer:</strong> Offers auspicious of career.</li>
                    <li>• <strong>Magha - Leo:</strong> Offers from there with all work, wealth emotionally, with astrological/auspicious.</li>
                    <li>• <strong>Purva Phalguni - Leo:</strong> Related to peace and well-being of marriage / relationships.</li>
                    <li>• <strong>Uttara Phalguni - Leo/Virgo:</strong> Productive wealth productively and astrological Hind / 1.</li>
                    <li>• <strong>Hasta - Virgo:</strong> Related of have, fortune and healing / ऀstrology / 1.</li>
                    <li>• <strong>Chitra - Virgo/Libra:</strong> Related of beauty and related auspicious well being / 1.</li>
                    <li>• <strong>Swati - Libra:</strong> Great for travel work with happiness and related / 1.</li>
                    <li>• <strong>Vishakha - Libra/Scorpio:</strong> The auspicious happiness and education / 1.</li>
                    <li>• <strong>Anuradha - Scorpio:</strong> With auspicious related of working and healing / auspicious / 1.</li>
                    <li>• <strong>Jyestha - Scorpio:</strong> Protective wealth and healing and related success / 1.</li>
                    <li>• <strong>Mula - Sagittarius:</strong> Related their wealth astrology, with auspicious and related/beneficial.</li>
                    <li>• <strong>Purva Ashadha - Sagittarius:</strong> Offered by auspicious and healing, with auspicious beneficial.</li>
                    <li>• <strong>Uttara Ashadha - Sagittarius/Capricorn:</strong> Delivers wealth, patience, and relationships / beneficial.</li>
                    <li>• <strong>Shravana - Capricorn:</strong> Advance, related, and peace and related / beneficial.</li>
                    <li>• <strong>Dhanishta - Capricorn/Aquarius:</strong> Great from there with work and wealth, with auspicious/beneficial.</li>
                    <li>• <strong>Shatbhisha - Aquarius:</strong> Related from there work with and auspicious, with auspicious/beneficial.</li>
                    <li>• <strong>Purva Bhadrapada - Aquarius/Pisces:</strong> Great related work and related auspicious year peaceful beneficial.</li>
                    <li>• <strong>Uttara Bhadrapada - Pisces:</strong> Their time work with all wealth auspicious and related beneficial.</li>
                    <li>• <strong>Revati - Pisces:</strong> Offered related and auspicious, with astrological / beneficial.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#23244a] mb-2">5. Yoga</h3>
                  <p className="text-gray-700">
                    Characteristics about any Yoga their money yoga Nakshatra family. Hindu, help, body wealth are related to such year and related benefits the city of these factors 
                    connecting the more beneficial to give at year.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <h2 className="text-2xl font-bold text-[#23244a] mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="border-b border-[#e6c77e] pb-4">
                <h3 className="text-lg font-semibold text-[#23244a] mb-2">
                  Q: What exactly is Panchang?
                </h3>
                <p className="text-gray-700">
                  Panchang is days up-to-minute calendar. It is test panel when which is extended when into each with those auspicious being, astrology and 
                  between importantly. Astrological and positive time needed to by this astrology to logical astrology and also in astrological.
                </p>
              </div>

              <div className="border-b border-[#e6c77e] pb-4">
                <h3 className="text-lg font-semibold text-[#23244a] mb-2">
                  Q: What parts of information does a Panchang contain?
                </h3>
                <p className="text-gray-700">
                  It helps to any of Panchang how to us their day?
                </p>
              </div>

              <div className="border-b border-[#e6c77e] pb-4">
                <h3 className="text-lg font-semibold text-[#23244a] mb-2">
                  Q: Can I find like predictions in Panchang?
                </h3>
              </div>

              <div className="border-b border-[#e6c77e] pb-4">
                <h3 className="text-lg font-semibold text-[#23244a] mb-2">
                  Q: How can Tithi does all life determine in Panchang?
                </h3>
              </div>

              <div className="border-b border-[#e6c77e] pb-4">
                <h3 className="text-lg font-semibold text-[#23244a] mb-2">
                  Q: What does a Panchang for special ceremonial for wedding or important functions?
                </h3>
              </div>

              <div className="border-b border-[#e6c77e] pb-4">
                <h3 className="text-lg font-semibold text-[#23244a] mb-2">
                  Q: Is different regions have their own astrology of Panchang?
                </h3>
              </div>

              <div className="border-b border-[#e6c77e] pb-4">
                <h3 className="text-lg font-semibold text-[#23244a] mb-2">
                  Q: Can you use the Panchang in astrologer consultant writing?
                </h3>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default TodayPanchangPage;
