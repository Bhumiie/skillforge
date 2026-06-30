function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200 py-10">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            <span className="text-blue-400">Skill</span>
            <span className="text-violet-400">Forge</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-slate-400">
            Build your network, level up together, and launch your next big idea.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-slate-400">
          <span>GitHub: github.com/skillforge</span>
          <span>LinkedIn: linkedin.com/company/skillforge</span>
          <span>Email: contact@skillforge.io</span>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} SkillForge. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
