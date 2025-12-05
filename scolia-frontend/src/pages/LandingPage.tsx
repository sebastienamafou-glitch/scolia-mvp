import React, { useState } from 'react';

// --- COMPOSANTS ICONS (SVG inline) ---
const IconCheck = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconMenu = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const IconX = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconZap = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconSmartphone = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
const IconShield = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconChevronDown = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

// --- DÉFINITION DES COULEURS ---
const SCOLIA_BLUE = '#0A2240';
const SCOLIA_ORANGE = '#F77F00';
const SCOLIA_GREEN = '#008F39';
const SCOLIA_GRAY = '#F4F6F8';

// --- LOGO SCOLIA ---
const Logo = ({ dark = false }: { dark?: boolean }) => (
    <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xl ${dark ? 'bg-white text-[${SCOLIA_BLUE}]' : `bg-[${SCOLIA_ORANGE}] text-white`}`}>
            S
        </div>
        <span className={`font-['Poppins'] font-bold text-2xl ${dark ? 'text-white' : `text-[${SCOLIA_BLUE}]`}`}>
            Scolia
        </span>
    </div>
);

// --- NAVBAR ---
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white/90 backdrop-blur-md fixed w-full z-50 shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Logo />
                
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 font-['Open Sans']">
                    <a href="#accueil" className={`text-gray-600 hover:text-[${SCOLIA_BLUE}] font-medium transition`}>Accueil</a>
                    <a href="#avantages" className={`text-gray-600 hover:text-[${SCOLIA_BLUE}] font-medium transition`}>Avantages</a>
                    <a href="#guide" className={`text-gray-600 hover:text-[${SCOLIA_BLUE}] font-medium transition`}>Mode d'Emploi</a>
                    <a href="#contact" className={`px-5 py-2.5 bg-[${SCOLIA_BLUE}] text-white rounded-full font-medium hover:bg-opacity-90 transition`}>
                        Devenir Pilote
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button className={`md:hidden text-[${SCOLIA_BLUE}]`} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <IconX /> : <IconMenu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full p-4 flex flex-col gap-4 shadow-lg font-['Open Sans']">
                    <a href="#accueil" onClick={() => setIsOpen(false)} className="text-gray-600 font-medium">Accueil</a>
                    <a href="#avantages" onClick={() => setIsOpen(false)} className="text-gray-600 font-medium">Avantages</a>
                    <a href="#guide" onClick={() => setIsOpen(false)} className="text-gray-600 font-medium">Mode d'Emploi</a>
                    <a href="#contact" onClick={() => setIsOpen(false)} className={`text-center px-5 py-3 bg-[${SCOLIA_BLUE}] text-white rounded-lg font-medium`}>
                        Devenir Pilote
                    </a>
                </div>
            )}
        </nav>
    );
};

// --- HERO SECTION ---
const Hero = () => (
    <section id="accueil" className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-br from-blue-50 to-white overflow-hidden relative">
        {/* Background Shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100/30 rounded-bl-[100px] -z-10"></div>
        
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-[${SCOLIA_ORANGE}] rounded-full text-sm font-semibold font-['Open Sans']`}>
                    <span className={`w-2 h-2 bg-[${SCOLIA_ORANGE}] rounded-full`}></span>
                    Nouveau en Côte d'Ivoire
                </div>
                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-[${SCOLIA_BLUE}] leading-tight font-['Poppins']`}>
                    Connectez enfin <br/>
                    votre école aux <span className={`text-[${SCOLIA_ORANGE}]`}>parents.</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg font-['Open Sans']">
                    L'application de gestion scolaire conçue pour l'Afrique. Notes, absences et paiements en temps réel, accessible même avec une faible connexion.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2 font-['Open Sans']">
                    <a href="#contact" className={`px-8 py-4 bg-[${SCOLIA_ORANGE}] text-white rounded-lg font-bold text-lg shadow-lg shadow-orange-200 hover:bg-opacity-90 hover:scale-105 transition transform text-center`}>
                        Demander une Démo
                    </a>
                    <a href="#guide" className={`px-8 py-4 bg-white text-[${SCOLIA_BLUE}] border-2 border-[${SCOLIA_BLUE}] rounded-lg font-bold text-lg hover:bg-blue-50 transition text-center flex items-center justify-center gap-2`}>
                        Voir le Mode d'Emploi
                    </a>
                </div>
            </div>
            
            {/* Mockup Visuel */}
            <div className="relative">
                <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-4 border-4 border-gray-100 max-w-sm mx-auto transform rotate-1 hover:rotate-0 transition duration-500">
                    <div className={`bg-[${SCOLIA_GRAY}] rounded-2xl overflow-hidden aspect-[9/18] relative flex flex-col`}>
                        {/* Mockup Header */}
                        <div className={`bg-[${SCOLIA_BLUE}] p-4 text-white flex justify-between items-center font-['Poppins']`}>
                            <div className="font-bold">Scolia</div>
                            <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                        </div>
                        {/* Mockup Body */}
                        <div className="p-4 space-y-4 flex-1 font-['Open Sans']">
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                    <div>
                                        <div className={`font-bold text-[${SCOLIA_BLUE}]`}>Kouadio Adriel</div>
                                        <div className="text-xs text-gray-500">4ème B</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                                <div className={`text-sm font-bold text-[${SCOLIA_BLUE}] mb-2`}>Dernières notes</div>
                                <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-2">
                                    <span>Mathématiques</span>
                                    <span className={`font-bold text-[${SCOLIA_GREEN}]`}>15/20</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Français</span>
                                    <span className={`font-bold text-[${SCOLIA_GREEN}]`}>13/20</span>
                                </div>
                            </div>
                            <div className={`bg-white p-4 rounded-xl shadow-sm border-l-4 border-[${SCOLIA_ORANGE}]`}>
                                <div className={`text-xs text-[${SCOLIA_ORANGE}] font-bold uppercase mb-1`}>Notification</div>
                                <div className="text-sm font-medium">Réunion parents-profs ce vendredi à 18h.</div>
                            </div>
                        </div>
                        {/* Mockup Nav */}
                        <div className="bg-white p-4 flex justify-around border-t">
                            <div className={`w-6 h-6 bg-[${SCOLIA_ORANGE}] rounded-full`}></div>
                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                </div>
                {/* Decorative blobs */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-[${SCOLIA_ORANGE}]/20 rounded-full blur-2xl`}></div>
                <div className={`absolute -bottom-10 -left-10 w-40 h-40 bg-[${SCOLIA_GREEN}]/20 rounded-full blur-2xl`}></div>
            </div>
        </div>
    </section>
);

// --- AVANTAGES SECTION ---
interface FeatureCardProps {
    icon: React.FC<any>;
    title: string;
    description: string;
    color: string;
}

const FeatureCard = ({ icon: Icon, title, description, color }: FeatureCardProps) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${color}`}>
            <Icon />
        </div>
        <h3 className={`text-xl font-bold text-[${SCOLIA_BLUE}] mb-3 font-['Poppins']`}>{title}</h3>
        <p className="text-gray-600 leading-relaxed font-['Open Sans']">{description}</p>
    </div>
);

const Features = () => (
    <section id="avantages" className="py-20 bg-white">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className={`text-3xl font-bold text-[${SCOLIA_BLUE}] mb-4 font-['Poppins']`}>Pourquoi choisir Scolia ?</h2>
                <p className="text-gray-600 font-['Open Sans']">Nous résolvons les vrais problèmes des établissements ivoiriens : communication, suivi et recouvrement.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={IconZap} 
                    color={`bg-orange-100 text-[${SCOLIA_ORANGE}]`}
                    title="Instantanéité" 
                    description="Fini les bulletins perdus. Les notes, devoirs et absences sont notifiés aux parents en temps réel via notification push." 
                />
                <FeatureCard 
                    icon={IconSmartphone} 
                    color={`bg-blue-100 text-[${SCOLIA_BLUE}]`}
                    title="Mobile First & Offline" 
                    description="Une Progressive Web App (PWA) ultra-légère. Elle s'installe sans Store et fonctionne même avec une connexion Internet instable." 
                />
                <FeatureCard 
                    icon={IconShield} 
                    color={`bg-green-100 text-[${SCOLIA_GREEN}]`}
                    title="Paiements Sécurisés" 
                    description="Suivez l'état des scolarités (Payé / En attente) directement depuis l'interface admin et sécurisez vos revenus." 
                />
            </div>
        </div>
    </section>
);

// --- OFFRE PILOTE SECTION ---
const PilotOffer = () => (
    <section className={`py-20 bg-[${SCOLIA_BLUE}] text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
            <div className={`inline-block px-4 py-1 border border-[${SCOLIA_ORANGE}] text-[${SCOLIA_ORANGE}] rounded-full text-sm font-bold mb-6 tracking-wide uppercase`}>
                Offre de Lancement
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 font-['Poppins']`}>Devenez un établissement pilote</h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10 font-['Open Sans']">
                Nous sélectionnons 10 établissements partenaires à Abidjan pour notre phase de lancement. Profitez de conditions exceptionnelles.
            </p>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl max-w-3xl mx-auto p-8 border border-white/10 md:flex items-center justify-between gap-8">
                <div className="text-left mb-6 md:mb-0">
                    <div className="text-4xl font-bold text-white mb-2">-50% <span className="text-xl font-normal text-blue-200">sur l'installation</span></div>
                    <div className={`text-[${SCOLIA_GREEN}] font-bold text-xl flex items-center gap-2 font-['Open Sans']`}>
                        <IconCheck /> 1 an d'abonnement OFFERT
                    </div>
                </div>
                <a href="#contact" className={`block w-full md:w-auto px-8 py-4 bg-[${SCOLIA_ORANGE}] text-white rounded-lg font-bold hover:bg-opacity-90 transition shadow-lg whitespace-nowrap font-['Open Sans']`}>
                    Je postule maintenant
                </a>
            </div>
        </div>
    </section>
);

// --- MODE D'EMPLOI SECTION (INTERACTIVE TABS) ---
const UserGuide = () => {
    const [activeTab, setActiveTab] = useState('parents');

    const tabs = [
        { id: 'parents', label: 'Pour les Parents', icon: '👨‍👩‍👧' },
        { id: 'profs', label: 'Pour les Enseignants', icon: '👨‍🏫' },
        { id: 'admin', label: 'Administration', icon: '👔' },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'parents':
                return (
                    <div className="grid md:grid-cols-2 gap-8 items-center animate-fade-in">
                        <div className="space-y-6 font-['Open Sans']">
                            <div className={`bg-blue-50 p-6 rounded-xl border-l-4 border-[${SCOLIA_BLUE}]`}>
                                <h4 className={`font-bold text-[${SCOLIA_BLUE}] text-lg mb-2 font-['Poppins']`}>1. Comment voir les notes ?</h4>
                                <p className="text-gray-600">Depuis l'accueil, cliquez sur la carte "Dernières Notes" ou sur l'icône "Notes" dans la barre du bas. Vous voyez instantanément les nouvelles notes saisies.</p>
                            </div>
                            <div className={`bg-orange-50 p-6 rounded-xl border-l-4 border-[${SCOLIA_ORANGE}]`}>
                                <h4 className={`font-bold text-[${SCOLIA_ORANGE}] text-lg mb-2 font-['Poppins']`}>2. Vérifier les absences</h4>
                                <p className="text-gray-600">Une notification push vous alerte dès qu'une absence est signalée. Retrouvez l'historique complet dans le menu "Absences".</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex justify-center font-['Open Sans']">
                            {/* Mockup simpliste d'écran parent */}
                            <div className="w-64 h-96 bg-gray-50 rounded-lg border-2 border-gray-200 p-3 relative">
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-200 rounded-b-lg"></div>
                                <div className="mt-8 space-y-3">
                                    <div className={`h-24 bg-[${SCOLIA_BLUE}] rounded-lg w-full flex items-center justify-center text-white text-xs font-['Poppins']`}>Tableau de bord Parent</div>
                                    <div className="h-12 bg-white rounded shadow-sm border w-full flex items-center px-2">
                                         <div className="w-8 h-8 rounded bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">15</div>
                                         <div className="ml-2 text-xs">Maths (Interro)</div>
                                    </div>
                                    <div className="h-12 bg-white rounded shadow-sm border w-full flex items-center px-2">
                                         <div className="w-8 h-8 rounded bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">18</div>
                                         <div className="ml-2 text-xs">Histoire (Devoir)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'profs':
                return (
                    <div className="grid md:grid-cols-2 gap-8 items-center animate-fade-in">
                        <div className="space-y-6 font-['Open Sans']">
                            <div className={`bg-green-50 p-6 rounded-xl border-l-4 border-[${SCOLIA_GREEN}]`}>
                                <h4 className={`font-bold text-[${SCOLIA_GREEN}] text-lg mb-2 font-['Poppins']`}>1. Faire l'appel (30 secondes)</h4>
                                <p className="text-gray-600">Connectez-vous et cliquez sur le gros bouton "Faire l'Appel". Sélectionnez votre classe. Par défaut, tous les élèves sont "Présents". Cliquez simplement sur les absents.</p>
                            </div>
                            <div className={`bg-blue-50 p-6 rounded-xl border-l-4 border-[${SCOLIA_BLUE}]`}>
                                <h4 className={`font-bold text-[${SCOLIA_BLUE}] text-lg mb-2 font-['Poppins']`}>2. Saisir des notes</h4>
                                <p className="text-gray-600">Cliquez sur "Saisir des Notes" &gt; Choisissez la matière &gt; Entrez les notes. C'est enregistré et transmis automatiquement.</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex justify-center font-['Open Sans']">
                             <div className="w-64 h-96 bg-gray-50 rounded-lg border-2 border-gray-200 p-3 relative">
                                <div className="mt-8 space-y-3">
                                    <div className="text-center font-bold text-gray-700">Appel - 4ème B</div>
                                    <div className="flex justify-between items-center bg-white p-2 rounded border">
                                        <span className="text-xs">Kouadio A.</span>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Présent</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-2 rounded border">
                                        <span className="text-xs">Bamba M.</span>
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Absent</span>
                                    </div>
                                    <div className={`w-full bg-[${SCOLIA_GREEN}] text-white text-center py-2 rounded text-sm font-bold mt-4`}>Valider l'appel</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'admin':
                return (
                    <div className="grid md:grid-cols-2 gap-8 items-center animate-fade-in">
                        <div className="space-y-6 font-['Open Sans']">
                            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-gray-500">
                                <h4 className={`font-bold text-gray-700 text-lg mb-2 font-['Poppins']`}>1. Gestion des élèves</h4>
                                <p className="text-gray-600">Dans votre espace Admin, allez dans "Utilisateurs" &gt; "Élèves" &gt; "Ajouter". Important : Liez l'élève à son parent pour activer le suivi.</p>
                            </div>
                            <div className={`bg-orange-50 p-6 rounded-xl border-l-4 border-[${SCOLIA_ORANGE}]`}>
                                <h4 className={`font-bold text-[${SCOLIA_ORANGE}] text-lg mb-2 font-['Poppins']`}>2. Envoyer une alerte</h4>
                                <p className="text-gray-600">Allez dans "Communication" &gt; "Notification Push". Rédigez votre message et choisissez la cible (Toute l'école ou une classe).</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex justify-center font-['Open Sans']">
                             <div className="w-80 h-64 bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm flex flex-col">
                                <div className={`border-b pb-2 mb-2 font-bold text-[${SCOLIA_BLUE}]`}>Admin Panel</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-blue-50 p-2 rounded text-center">
                                        <div className={`text-lg font-bold text-[${SCOLIA_BLUE}]`}>850</div>
                                        <div className="text-[10px] uppercase">Élèves</div>
                                    </div>
                                    <div className="bg-orange-50 p-2 rounded text-center">
                                        <div className={`text-lg font-bold text-[${SCOLIA_ORANGE}]`}>3</div>
                                        <div className="text-[10px] uppercase">Alertes</div>
                                    </div>
                                </div>
                                <div className="mt-4 text-xs text-gray-500">Derniers paiements...</div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <section id="guide" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className={`text-3xl font-bold text-[${SCOLIA_BLUE}] mb-4 font-['Poppins']`}>Mode d'Emploi</h2>
                    <p className="text-gray-600 font-['Open Sans']">Une prise en main immédiate pour tout le monde.</p>
                </div>

                {/* Tabs Header */}
                <div className="flex flex-wrap justify-center gap-4 mb-10 font-['Open Sans']">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-full text-sm md:text-base font-bold transition flex items-center gap-2 border-2 ${
                                activeTab === tab.id 
                                ? `bg-[${SCOLIA_BLUE}] text-white border-[${SCOLIA_BLUE}] shadow-lg` 
                                : 'bg-white text-gray-500 border-transparent hover:border-gray-200'
                            }`}
                        >
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tabs Content */}
                <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 shadow-xl">
                    {renderContent()}
                </div>

                {/* Global Install Guide */}
                <div className="max-w-3xl mx-auto mt-12 bg-white p-6 rounded-xl border border-gray-200 text-center font-['Open Sans']">
                    <h3 className={`font-bold text-[${SCOLIA_BLUE}] mb-4 flex items-center justify-center gap-2 font-['Poppins']`}>
                        <IconSmartphone className={`text-[${SCOLIA_ORANGE}]`} /> Comment installer l'application ?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-left">
                        <div><span className={`font-bold text-[${SCOLIA_ORANGE}]`}>1.</span> Ouvrez <b>app.scolia.ci</b> sur Chrome ou Safari.</div>
                        <div><span className={`font-bold text-[${SCOLIA_ORANGE}]`}>2.</span> Cliquez sur le menu (3 points) ou "Partager".</div>
                        <div><span className={`font-bold text-[${SCOLIA_ORANGE}]`}>3.</span> Sélectionnez <b>"Ajouter à l'écran d'accueil"</b>.</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- FAQ COMPONENT ---
interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button 
                className="w-full py-4 text-left flex justify-between items-center focus:outline-none group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`font-semibold transition font-['Open Sans'] ${isOpen ? `text-[${SCOLIA_ORANGE}]` : `text-gray-700 group-hover:text-[${SCOLIA_BLUE}]`}`}>
                    {question}
                </span>
                <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <IconChevronDown className="text-gray-400" />
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-600 text-sm leading-relaxed pr-8 font-['Open Sans']">
                    {answer}
                </p>
            </div>
        </div>
    );
};

const FAQ = () => (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
            <h2 className={`text-3xl font-bold text-[${SCOLIA_BLUE}] mb-10 text-center font-['Poppins']`}>Questions Fréquentes</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                <FAQItem 
                    question="Faut-il acheter un ordinateur puissant ?" 
                    answer="Non, Scolia est 100% web. Tout est hébergé de manière sécurisée dans le Cloud. Vous avez juste besoin d'un téléphone ou d'un ordinateur standard." 
                />
                <FAQItem 
                    question="Et si je n'ai pas de connexion Internet ?" 
                    answer="L'application est conçue 'Mobile First' pour fonctionner avec une connexion 3G faible. Les données essentielles (emploi du temps) restent accessibles hors ligne." 
                />
                <FAQItem 
                    question="Mes données sont-elles en sécurité ?" 
                    answer="Oui. Nous utilisons un cryptage SSL (HTTPS) identique à celui des banques. Vos données ne sont jamais partagées avec des tiers." 
                />
                 <FAQItem 
                    question="Combien de temps faut-il pour l'installer ?" 
                    answer="Pour un établissement pilote, nous pouvons déployer la solution en 48 heures, incluant la configuration de vos classes et élèves." 
                />
            </div>
        </div>
    </section>
);

// --- CONTACT & FOOTER ---
const Footer = () => (
    <footer id="contact" className={`bg-[${SCOLIA_BLUE}] text-white pt-20 pb-10`}>
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div className="space-y-4">
                    <Logo dark={true} />
                    <p className="text-blue-200 text-sm leading-relaxed font-['Open Sans']">
                        Scolia est la solution de gestion scolaire nouvelle génération pour l'Afrique de l'Ouest. Simplifiez la vie de votre établissement.
                    </p>
                </div>
                
                <div className="font-['Open Sans']">
                    <h4 className={`font-bold text-lg mb-6 font-['Poppins']`}>Liens Rapides</h4>
                    <ul className="space-y-3 text-blue-200 text-sm">
                        <li><a href="#accueil" className="hover:text-white transition">Accueil</a></li>
                        <li><a href="#guide" className="hover:text-white transition">Mode d'emploi</a></li>
                        <li><a href="#" className="hover:text-white transition">Espace Admin</a></li>
                        <li><a href="#" className="hover:text-white transition">Mentions Légales</a></li>
                    </ul>
                </div>

                <div className="lg:col-span-2">
                    <h4 className={`font-bold text-lg mb-6 text-[${SCOLIA_ORANGE}] font-['Poppins']`}>Devenir Établissement Pilote</h4>
                    <form className="space-y-4 font-['Open Sans']" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Nom de l'école" className={`w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-800 text-white placeholder-blue-300 focus:outline-none focus:border-[${SCOLIA_ORANGE}]`} />
                            <input type="text" placeholder="Nom du Directeur" className={`w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-800 text-white placeholder-blue-300 focus:outline-none focus:border-[${SCOLIA_ORANGE}]`} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input type="tel" placeholder="Numéro de téléphone" className={`w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-800 text-white placeholder-blue-300 focus:outline-none focus:border-[${SCOLIA_ORANGE}]`} />
                            <button className={`w-full px-4 py-3 bg-[${SCOLIA_ORANGE}] text-white font-bold rounded-lg hover:bg-opacity-90 transition shadow-lg`}>
                                Demander un Rappel
                            </button>
                        </div>
                        <p className="text-xs text-blue-300 mt-2">*Offre limitée aux 10 premiers établissements.</p>
                    </form>
                </div>
            </div>
            
            <div className="border-t border-blue-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-400 font-['Open Sans']">
                <div>&copy; 2025 Scolia Côte d'Ivoire. Tous droits réservés.</div>
                <div className="flex gap-4">
                    <span>Abidjan, Cocody</span>
                    <span>•</span>
                    <span>contact@scolia.ci</span>
                </div>
            </div>
        </div>
    </footer>
);

// --- MAIN APP COMPONENT ---
const LandingPage: React.FC = () => {
    return (
        // La classe font-['Open Sans'] définie sur l'élément racine garantit que la police par défaut est Open Sans
        // et les éléments spécifiques utilisent font-['Poppins'] pour les titres.
        <div className="font-['Open Sans'] text-slate-800 antialiased smooth-scroll bg-slate-50 min-h-screen">
            <Navbar />
            <Hero />
            <Features />
            <PilotOffer />
            <UserGuide />
            <FAQ />
            <Footer />
        </div>
    );
};

export default LandingPage;
