import OpenPositionsSection from "../components/Positions/OpenPositionsSection";

export default function PositionsPage() {
  return (
    <div className="min-h-screen bg-[#0F1A24] text-white pt-14 md:pt-16 pb-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <OpenPositionsSection />
      </div>
    </div>
  );
}
