% Classe personnalisée pour les rapports EHTP - Style académique officiel
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{rapportECL}[2024/10/03 Classe pour rapports EHTP - Style officiel]

% Classe de base
\LoadClass[12pt,a4paper]{report}
% Packages requis
\RequirePackage{tikz} % Pour les dessins vectoriels
\RequirePackage{fontawesome5} % Pour les icônes
\RequirePackage[utf8]{inputenc}
\RequirePackage[french,shorthands=off]{babel}
\RequirePackage{graphicx}
\RequirePackage{geometry}
\RequirePackage{fancyhdr}
\RequirePackage{xcolor}
\RequirePackage{titlesec}
\RequirePackage{setspace}
\RequirePackage{array}
\RequirePackage{fontspec}
\setmainfont{TeX Gyre Heros}
\setsansfont{TeX Gyre Heros}
\renewcommand{\familydefault}{\sfdefault}
\RequirePackage{ragged2e}
 
% Police calligraphique pour certains titres (ITC Edwardian Script Pro Bold si dispo)
\RequirePackage{iftex}
% Par défaut: aucun changement de police
\newcommand{\scriptheading}[1]{#1}
% Si XeLaTeX/LuaLaTeX: utiliser une police système
\ifPDFTeX
  % pdfLaTeX: utiliser une police script intégrée (Zapf Chancery via pzc)
  \RequirePackage{chancery}
  \typeout{[rapportECL] scriptheading: pdfLaTeX detected -> using Zapf Chancery (pzc).}
  \renewcommand{\scriptheading}[1]{{\fontfamily{pzc}\selectfont #1}}
\else
  \RequirePackage{fontspec}
  % Détection et définition robuste de la police de titres
  \newif\ifScriptFontSet
  \ScriptFontSetfalse
  % -1) Dossier local du projet (recommandé)
  %    (1) fichiers sans espaces
  \IfFileExists{fonts/edwardian/EdwardianScriptITCBold.otf}{%
    \newfontfamily\ScriptFont[NFSSFamily=EdwardianScript,BoldFont={},ItalicFont={},SmallCapsFont={}]{fonts/edwardian/EdwardianScriptITCBold.otf}
    \typeout{[rapportECL] scriptheading: using local fonts/edwardian/EdwardianScriptITCBold.otf}
    \ScriptFontSettrue
  }{}
  \ifScriptFontSet\else
    \IfFileExists{fonts/edwardian/EdwardianScriptITCBold.ttf}{%
      \newfontfamily\ScriptFont{fonts/edwardian/EdwardianScriptITCBold.ttf}
      \typeout{[rapportECL] scriptheading: using local fonts/edwardian/EdwardianScriptITCBold.ttf}
      \ScriptFontSettrue
    }{}
  \fi
  %    (2) fichiers avec espaces
  \ifScriptFontSet\else
    \IfFileExists{fonts/edwardian/Edwardian Script ITC Bold.otf}{%
      \newfontfamily\ScriptFont[Path=fonts/edwardian/,Extension=.otf]{Edwardian Script ITC Bold}
      \typeout{[rapportECL] scriptheading: using local fonts/edwardian/(.otf) Edwardian Script ITC Bold}
      \ScriptFontSettrue
    }{}
  \fi
  \ifScriptFontSet\else
    \IfFileExists{fonts/edwardian/Edwardian Script ITC Bold.ttf}{%
      \newfontfamily\ScriptFont[Path=fonts/edwardian/,Extension=.ttf]{Edwardian Script ITC Bold}
      \typeout{[rapportECL] scriptheading: using local fonts/edwardian/(.ttf) Edwardian Script ITC Bold}
      \ScriptFontSettrue
    }{}
  \fi
  % 0) Chemin absolu fourni par l'utilisateur (Windows)
  \IfFileExists{C:/Users/Admin/Downloads/Programs/edwardian-script-itc-bold/Edwardian Script ITC Bold.otf}{%
    \newfontfamily\ScriptFont{C:/Users/Admin/Downloads/Programs/edwardian-script-itc-bold/Edwardian Script ITC Bold.otf}
    \typeout{[rapportECL] scriptheading: using absolute OTF from Downloads.}
    \ScriptFontSettrue
  }{}
  % 0b) Variante .ttf au même emplacement
  \ifScriptFontSet\else
    \IfFileExists{C:/Users/Admin/Downloads/Programs/edwardian-script-itc-bold/Edwardian Script ITC Bold.ttf}{%
      \newfontfamily\ScriptFont{C:/Users/Admin/Downloads/Programs/edwardian-script-itc-bold/Edwardian Script ITC Bold.ttf}
      \typeout{[rapportECL] scriptheading: using absolute TTF from Downloads.}
      \ScriptFontSettrue
    }{}
  \fi
  % 1) Essayer le nom de police exact "Edwardian Script ITC Bold"
  \ifScriptFontSet\else
    \IfFontExistsTF{Edwardian Script ITC Bold}{%
      \newfontfamily\ScriptFont{Edwardian Script ITC Bold}
      \typeout{[rapportECL] scriptheading: using system font "Edwardian Script ITC Bold"}
      \ScriptFontSettrue
    }{}
  \fi
  % 1b) Police script incluse dans TeX Live: TeX Gyre Chorus (très proche de Chancery)
  \ifScriptFontSet\else
    \IfFontExistsTF{TeX Gyre Chorus}{%
      \newfontfamily\ScriptFont{TeX Gyre Chorus}
      \typeout{[rapportECL] scriptheading: using TeX Gyre Chorus (TeX Live)}
      \ScriptFontSettrue
    }{}
  \fi
  % 2) Essayer la variante Pro Bold explicite
  \IfFontExistsTF{ITC Edwardian Script Pro Bold}{
    \newfontfamily\ScriptFont{ITC Edwardian Script Pro Bold}
    \typeout{[rapportECL] scriptheading: using system font "ITC Edwardian Script Pro Bold"}
    \ScriptFontSettrue
  }{}
  % 3) Sinon, essayer le nom courant Windows "Edwardian Script ITC" en simulant le gras
  \ifScriptFontSet\else
    \IfFontExistsTF{Edwardian Script ITC}{
      \newfontfamily\ScriptFont{Edwardian Script ITC}[FakeBold=2.0]
      \typeout{[rapportECL] scriptheading: using system font "Edwardian Script ITC" with FakeBold}
      \ScriptFontSettrue
    }{}
  \fi
  % 4) Sinon, fallback vers Great Vibes si présent
  \ifScriptFontSet\else
    \IfFontExistsTF{Great Vibes}{
      \newfontfamily\ScriptFont{Great Vibes}
      \typeout{[rapportECL] scriptheading: using Great Vibes}
      \ScriptFontSettrue
    }{}
  \fi
  % 5) Dernier recours: Times
  \ifScriptFontSet\else
    \newfontfamily\ScriptFont{Times New Roman}
    \typeout{[rapportECL] scriptheading: fallback to Times New Roman}
  \fi
  \renewcommand{\scriptheading}[1]{{\ScriptFont #1}}
\fi

\geometry{left=2.5cm, right=2.5cm, top=3cm, bottom=3cm}
  % Couleurs ECL
  \definecolor{eclblue}{RGB}{0,84,159}
  \definecolor{eclgray}{RGB}{128,128,128}
 
% Champs personnalisés (stockage interne et commandes utilisateurs)
\makeatletter
\providecommand{\@establishment}{}
\providecommand{\@program}{}
\providecommand{\@supervisor}{}
\providecommand{\@company}{}
\providecommand{\@academicyear}{}
\providecommand{\@jury}{}
\providecommand{\@soutenance}{}
\providecommand{\@department}{}
\providecommand{\@filiere}{}

\newcommand{\establishment}[1]{\gdef\@establishment{#1}}
\newcommand{\program}[1]{\gdef\@program{#1}}
\newcommand{\supervisor}[1]{\gdef\@supervisor{#1}}
\newcommand{\company}[1]{\gdef\@company{#1}}
\newcommand{\academicyear}[1]{\gdef\@academicyear{#1}}
\newcommand{\jury}[1]{\gdef\@jury{#1}}
\newcommand{\soutenance}[1]{\gdef\@soutenance{#1}}
\newcommand{\department}[1]{\gdef\@department{#1}}
\newcommand{\filiere}[1]{\gdef\@filiere{#1}}
\makeatother

% Paramètres visuels par défaut (dimensions/recadrage logos)
\providecommand{\maroclogowidth}{0.22\textwidth}
% Valeurs trim avec unités explicites pour graphicx (l b r t)
\providecommand{\maroclogotrim}{0bp 0bp 0bp 0bp}
\providecommand{\ohselogowidth}{0.32\textwidth}

\renewcommand{\maketitle}{%
    \begin{titlepage}
        \newgeometry{left=1cm,right=1.5cm,top=1.5cm,bottom=1.5cm,headheight=0pt,headsep=0pt,footskip=0pt}
        \par % Force paragraph mode
        \begin{spacing}{1.05}
        \thispagestyle{empty}
        
        % Logo Ministère des Affaires Étrangères, de la Coopération Africaine et des MRE
        \begin{center}
            \IfFileExists{logos/Minist-Affaires-Etrangeres-logo.jpg}{%
                \includegraphics[width=6cm,keepaspectratio]{logos/Minist-Affaires-Etrangeres-logo.jpg}%
            }{%
                \textbf{\LARGE ROYAUME DU MAROC\\[0.15cm]MINISTÈRE DES AFFAIRES ÉTRANGÈRES, DE LA COOPÉRATION AFRICAINE ET DES MAROCAINS RÉSIDANT À L'ÉTRANGER}%
            }
        \end{center}

        \vspace{0.4cm}

        \begin{center}
            {\normalsize \textbf{\textsf{ROYAUME DU MAROC --- FONCTION PUBLIQUE}}}\\[0.15cm]
            {\normalsize \textit{\textsf{\csname @department\endcsname}}}\\[0.1cm]
            {\small \textsf{\csname @filiere\endcsname}}
        \end{center}

        \vfill

        % Lignes et Titre
        \begin{center}
            \textcolor{eclblue}{\rule{0.95\textwidth}{3.5pt}}\par
            \vspace{0.1cm}
            {\centering \LARGE \sffamily \bfseries \linespread{1.3}\selectfont \csname @title\endcsname \par}
            \vspace{0.3cm}
            \textcolor{eclblue}{\rule{0.95\textwidth}{3.5pt}}
        \end{center}

        \vfill

        % Informations Candidat et Concours
        \begin{minipage}[t]{0.48\textwidth}
            \begin{flushleft}
                {\normalsize \textbf{\textsf{Réalisé par :}}}\\[0.15cm]
                \csname @author\endcsname
            \end{flushleft}
        \end{minipage}%
        \hfill%
        \begin{minipage}[t]{0.48\textwidth}
            \begin{flushleft}
                {\normalsize \textbf{\textsf{Organisme Recruteur :}}}\\[0.15cm]
                \csname @supervisor\endcsname
            \end{flushleft}
        \end{minipage}

        \vfill

        \begin{center}
            \begin{tcolorbox}[colback=gray!5!white,colframe=eclblue,arc=2mm,width=0.95\textwidth,boxrule=1pt]
                \centering
                \vspace{0.1cm}
                {\large \textbf{\textsf{Épreuves Écrites --- Concours du 27 Septembre 2026 (FSJES Salé)}}}\\[0.2cm]
                {\small \textsf{Spécialité Informatique \& Réseaux $\bullet$ Rédaction sur les Attributions du Ministère $\bullet$ Oral}}\\[0.1cm]
            \end{tcolorbox}
        \end{center}

        \vfill
        
        % Footer
        \begin{minipage}[b]{0.3\textwidth}
            \begin{flushleft}
                \csname @establishment\endcsname
            \end{flushleft}
        \end{minipage}%
        \begin{minipage}[b]{0.4\textwidth}
            \begin{center}
                \csname @academicyear\endcsname
            \end{center}
        \end{minipage}%
        \begin{minipage}[b]{0.3\textwidth}
            \begin{flushright}
                \textbf{MAECAME}
            \end{flushright}
        \end{minipage}

        \restoregeometry
        \end{spacing}
    \end{titlepage}
}


% Personnalisation des titres de sections
\titleformat{\section}
{\normalfont\Large\bfseries\color{eclblue}}
{\thesection}
{1em}
{}
% Configuration de l'espacement
\onehalfspacing

% Marque de chapitre sans capitalisation forcée pour permettre les césures/retours
\renewcommand{\chaptermark}[1]{\markboth{Chapitre \thechapter.\ #1}{}}

% Configuration des en-têtes
\pagestyle{fancy}
\fancyhf{}
% Titre + numéro dans une seule boîte de largeur \headwidth pour éviter tout chevauchement
\fancyhead[C]{\textcolor{eclgray}{\hbox to\headwidth{\parbox[t]{\dimexpr\headwidth-7.5cm\relax}{\raggedright\sloppy\footnotesize\nouppercase{\leftmark}}\hfil\makebox[7.5cm][r]{\thepage}}}}
\renewcommand{\headrulewidth}{0.5pt}
\renewcommand{\headrule}{\hbox to\headwidth{\color{eclblue}\leaders\hrule height \headrulewidth\hfill}}
% Ajuster la hauteur d'en-tête pour éviter l'avertissement fancyhdr
\setlength{\headheight}{40pt}

% Redéfinition du style de page pour les chapitres
\fancypagestyle{plain}{%
    \fancyhf{}
    \fancyfoot[C]{\textcolor{eclgray}{\thepage}}
    \renewcommand{\headrulewidth}{0pt}
    \renewcommand{\footrulewidth}{0pt}
}
