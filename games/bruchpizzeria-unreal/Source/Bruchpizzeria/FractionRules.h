#pragma once
#include <algorithm>
#include <bit>
#include <cmath>
#include <cstdint>
#include <limits>
#include <numeric>
#include <string>
#include <utility>
#include <vector>
namespace PizzaRules {
struct Rational {
    int Num = 0, Den = 1;
    bool Valid = true;
    Rational(int n=0,int d=1) { Assign(n,d); }
    // Wide intermediate arithmetic avoids signed int overflow before reduction.
    void Assign(std::int64_t n, std::int64_t d) {
        Num=0; Den=1; Valid=false;
        if (n==std::numeric_limits<std::int64_t>::min() || d==std::numeric_limits<std::int64_t>::min()) return;
        if (d==0) return;
        if (d<0) { n=-n; d=-d; }
        const auto divisor=std::gcd(n,d);
        n/=divisor; d/=divisor;
        if (n<std::numeric_limits<int>::min() || n>std::numeric_limits<int>::max() || d>std::numeric_limits<int>::max()) return;
        Num=static_cast<int>(n); Den=static_cast<int>(d); Valid=true;
    }
};
inline bool Equal(Rational a, Rational b) {
    return a.Valid && b.Valid && a.Num==b.Num && a.Den==b.Den;
}
inline Rational Calculate(char op, Rational a, Rational b) {
    Rational result(1,0);
    if (!a.Valid || !b.Valid) return result;
    const std::int64_t an=a.Num,ad=a.Den,bn=b.Num,bd=b.Den;
    switch(op) {
        case '+': result.Assign(an*bd+bn*ad,ad*bd); break;
        case '-': result.Assign(an*bd-bn*ad,ad*bd); break;
        case '*': result.Assign(an*bn,ad*bd); break;
        case '/': if (bn!=0) result.Assign(an*bd,ad*bn); break;
        default: break;
    }
    return result;
}
inline std::string Format(Rational value) {
    if (!value.Valid) return "ungültig";
    if (value.Den==1) return std::to_string(value.Num);
    return std::to_string(value.Num)+"/"+std::to_string(value.Den);
}
class PizzaCuts {
    static constexpr double Pi=3.14159265358979323846;
    static constexpr double EqualTolerance=2.0*Pi/180.0;
    std::vector<double> Diameters;
public:
    bool AddDiameter(double degrees) {
        if (!std::isfinite(degrees) || Diameters.size()>=4) return false;
        double angle=std::fmod(degrees,180.0)*Pi/180.0;
        if (angle<0) angle+=Pi;
        for (const double existing:Diameters) {
            const double difference=std::abs(existing-angle);
            if (std::min(difference,Pi-difference)<Pi/180.0) return false;
        }
        Diameters.push_back(angle);
        return true;
    }
    // Coordinates are normalized to pizza radius 1. Near-central long strokes
    // snap to a radial diameter; off-pizza, tangential and short gestures fail.
    bool AddStroke(double x0,double y0,double x1,double y1) {
        if (!std::isfinite(x0) || !std::isfinite(y0) || !std::isfinite(x1) || !std::isfinite(y1)) return false;
        if (std::hypot(x0,y0)>1.0+1e-9 || std::hypot(x1,y1)>1.0+1e-9) return false;
        const double dx=x1-x0,dy=y1-y0,length=std::hypot(dx,dy);
        if (length<1.6) return false;
        const double projection=-(x0*dx+y0*dy)/(length*length);
        if (projection<=0 || projection>=1 || std::abs(x0*dy-y0*dx)/length>0.12) return false;
        return AddDiameter(std::atan2(dy,dx)*180.0/Pi);
    }
    int Count() const { return Diameters.empty() ? 1 : static_cast<int>(Diameters.size()*2); }
    bool EqualParts() const {
        const int count=Count();
        if (count==6) return false;
        const auto boundaries=Boundaries();
        const double expected=2.0*Pi/count;
        for (int i=0;i<count;++i) {
            if (std::abs(boundaries[i+1]-boundaries[i]-expected)>EqualTolerance+1e-10) return false;
        }
        return true;
    }
    // Actual radians, ascending; final endpoint wraps the first ray + 2pi.
    // It may exceed 2pi, avoiding an artificial piece at the world-axis seam.
    std::vector<double> Boundaries() const {
        if (Diameters.empty()) return {0.0,2.0*Pi};
        std::vector<double> result;
        for (const double angle:Diameters) { result.push_back(angle); result.push_back(angle+Pi); }
        std::sort(result.begin(),result.end());
        result.push_back(result.front()+2.0*Pi);
        return result;
    }
    Rational Selected(std::uint32_t mask) const {
        const int count=Count();
        const std::uint32_t allowed=(std::uint32_t(1)<<count)-1;
        if (mask==0 || (mask & ~allowed)!=0 || !EqualParts()) return Rational(1,0);
        return Rational(std::popcount(mask),count);
    }
};
struct LessonStep { std::string Prompt; int Correct; std::vector<int> Choices; };
namespace Detail {
inline bool Small(Rational value) { return value.Valid && value.Num>=-64 && value.Num<=64 && value.Den<=64; }
inline bool Append(std::vector<LessonStep>& lesson,std::string prompt,int correct) {
    if (correct< -64 || correct>64) return false;
    std::vector<int> choices{correct};
    for (int offset=1;choices.size()<4;++offset) {
        if (correct+offset<=64) choices.push_back(correct+offset);
        if (choices.size()<4 && correct-offset>=-64) choices.push_back(correct-offset);
    }
    const auto rotation=static_cast<std::size_t>((correct+64)%4);
    std::rotate(choices.begin(),choices.begin()+rotation,choices.end());
    lesson.push_back({std::move(prompt),correct,std::move(choices)});
    return true;
}
}
inline std::vector<LessonStep> MakeLesson(Rational wanted,Rational delivered,char op=' ',Rational a=Rational(),Rational b=Rational()) {
    if (!Detail::Small(wanted)) return {};
    std::vector<LessonStep> lesson;
    const std::string context="Bestellt: "+Format(wanted)+" Pizza. "+
        (delivered.Valid ? "Geliefert: "+Format(delivered)+" Pizza. " : "Deine Auswahl bildet noch keinen gültigen Bruch aus gleich großen Stücken. ");
    if (op==' ') {
        if (wanted.Num<0 || wanted.Num>wanted.Den) return {};
        Detail::Append(lesson,context+"Wir nehmen eine ganze Pizza als Einheit. Wie viele ganze Pizzen sind das?",1);
        Detail::Append(lesson,"Der Nenner zählt gleich große Teile. In wie viele gleich große Stücke teilen wir eine ganze Pizza für "+Format(wanted)+"?",wanted.Den);
        Detail::Append(lesson,"Der Zähler zählt die ausgewählten Stücke. Wie viele dieser gleich großen Stücke gehören zur Bestellung "+Format(wanted)+"?",wanted.Num);
        return lesson;
    }
    if (!Detail::Small(a) || !Detail::Small(b)) return {};
    const Rational result=Calculate(op,a,b);
    if (!Detail::Small(result) || !Equal(wanted,result)) return {};
    const std::string expression=Format(a)+" "+std::string(1,op)+" "+Format(b);
    int rawNumerator=0,rawDenominator=0;
    if (op=='+' || op=='-') {
        const int common=(a.Den/std::gcd(a.Den,b.Den))*b.Den;
        if (common>64) return {};
        const int convertedA=a.Num*(common/a.Den),convertedB=b.Num*(common/b.Den);
        if (!Detail::Append(lesson,context+"Für "+expression+" brauchen wir gleich große Teile. Was ist der kleinste gemeinsame Nenner?",common) ||
            !Detail::Append(lesson,"Erweitere "+Format(a)+" auf den Nenner "+std::to_string(common)+". Welcher Zähler gehört dazu?",convertedA) ||
            !Detail::Append(lesson,"Erweitere "+Format(b)+" auf den Nenner "+std::to_string(common)+". Welcher Zähler gehört dazu?",convertedB)) return {};
        rawNumerator=op=='+' ? convertedA+convertedB : convertedA-convertedB;
        rawDenominator=common;
        if (!Detail::Append(lesson,"Die Teile sind jetzt gleich groß. "+std::string(op=='+' ? "Addiere" : "Subtrahiere")+" die Zähler. Welchen Zähler erhältst du vor dem Kürzen?",rawNumerator)) return {};
        if (rawNumerator!=result.Num || rawDenominator!=result.Den) {
            Detail::Append(lesson,"Kürze "+std::to_string(rawNumerator)+"/"+std::to_string(rawDenominator)+". Wie lautet der gekürzte Zähler?",result.Num);
        }
    } else if (op=='*' || op=='/') {
        int secondNumerator=b.Num,secondDenominator=b.Den;
        if (op=='/') {
            if (b.Num==0) return {};
            const Rational reciprocal(b.Den,b.Num);
            Detail::Append(lesson,context+"Bei "+expression+" multiplizieren wir mit dem Kehrwert des zweiten Bruchs. Welchen Zähler hat dieser Kehrwert?",reciprocal.Num);
            Detail::Append(lesson,"Beim Kehrwert tauschen Zähler und Nenner ihre Rollen. Welchen Nenner hat der Kehrwert von "+Format(b)+"?",reciprocal.Den);
            secondNumerator=reciprocal.Num; secondDenominator=reciprocal.Den;
        }
        rawNumerator=a.Num*secondNumerator; rawDenominator=a.Den*secondDenominator;
        if (!Detail::Append(lesson,(op=='*' ? context+"Berechne "+expression+". " : std::string())+"Multipliziere die Zähler. Welchen Zähler erhältst du vor dem Kürzen?",rawNumerator) ||
            !Detail::Append(lesson,"Multipliziere die Nenner. Welchen Nenner erhältst du vor dem Kürzen?",rawDenominator)) return {};
        Detail::Append(lesson,"Kürze "+std::to_string(rawNumerator)+"/"+std::to_string(rawDenominator)+" vollständig. Wie lautet der gekürzte Zähler?",result.Num);
    } else return {};
    Detail::Append(lesson,"Wie lautet der Nenner des vollständig gekürzten Ergebnisses? Danach kannst du die passende Portion neu zubereiten.",result.Den);
    return lesson;
}
}
