#include "../Source/Bruchpizzeria/FractionRules.h"
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <limits>

namespace {
int Checks = 0, Failures = 0;
void Check(bool pass, const char* message) {
    ++Checks;
    if (!pass) { ++Failures; std::cerr << "FAIL: " << message << '\n'; }
}
void Fraction(PizzaRules::Rational actual, int numerator, int denominator, const char* message) {
    Check(actual.Valid && actual.Num == numerator && actual.Den == denominator, message);
}
void LessonAnswers(const std::vector<PizzaRules::LessonStep>& lesson, std::initializer_list<int> expected, const char* message) {
    bool correct=lesson.size()==expected.size();
    std::size_t index=0;
    for (const int value:expected) {
        if (index<lesson.size()) correct=correct && lesson[index].Correct==value;
        ++index;
    }
    Check(correct,message);
    for (const auto& step:lesson) {
        const auto answers=std::count(step.Choices.begin(),step.Choices.end(),step.Correct);
        auto sorted=step.Choices; std::sort(sorted.begin(),sorted.end());
        Check(!step.Prompt.empty() && step.Choices.size()>=3 && answers==1 && std::adjacent_find(sorted.begin(),sorted.end())==sorted.end(),"guided step has contextual prompt and unique selectable correct choice");
        Check(std::all_of(step.Choices.begin(),step.Choices.end(),[](int value){return value>=-64 && value<=64;}),"lesson choices stay within small values");
    }
}
}

int main() {
    using namespace PizzaRules;
    Fraction(Rational(2,4),1,2,"normalize two quarters to half");
    Fraction(Rational(-6,-8),3,4,"negative denominator changes sign");
    Fraction(Rational(0,-8),0,1,"zero has canonical denominator");
    Check(!Rational(1,0).Valid,"zero denominator is invalid");
    Check(Equal(Rational(2,4),Rational(1,2)),"equivalent fractions compare equal");
    Check(!Equal(Rational(1,0),Rational(1,0)),"invalid fractions never compare equal");
    Fraction(Calculate('+',Rational(1,2),Rational(1,4)),3,4,"add different denominators");
    Fraction(Calculate('-',Rational(1,2),Rational(3,4)),-1,4,"subtract into negative fraction");
    Fraction(Calculate('*',Rational(2,3),Rational(3,4)),1,2,"multiply and simplify");
    Fraction(Calculate('/',Rational(1,2),Rational(3,4)),2,3,"divide by reciprocal");
    Check(!Calculate('/',Rational(1,2),Rational(0,1)).Valid,"division by zero invalid");
    Check(!Calculate('?',Rational(1,2),Rational(1,4)).Valid,"unknown operation invalid");
    Check(!Calculate('+',Rational(1,0),Rational(1,4)).Valid,"invalid operand propagates");
    Check(Format(Rational(7,8)) == "7/8","fraction display");
    Check(Format(Rational(2,2)) == "1","whole display");
    Check(Format(Rational(1,0)) == "ungültig","invalid display");
    Check(!Calculate('+',Rational(std::numeric_limits<int>::max()),Rational(1)).Valid,"overflow invalid without undefined behavior");
    Check(!Rational(1,std::numeric_limits<int>::min()).Valid,"unrepresentable positive denominator invalid");
    Check(!Rational(std::numeric_limits<int>::min(),-1).Valid,"negative minimum numerator cannot overflow on normalization");
    Fraction(Rational(std::numeric_limits<int>::min(),std::numeric_limits<int>::min()),1,1,"minimum integer inputs can reduce safely");
    Fraction(Calculate('*',Rational(64,63),Rational(63,64)),1,1,"products reduce before int range check");
    PizzaCuts pizza;
    Check(pizza.Count()==1 && pizza.EqualParts(),"uncut pizza is one whole");
    const auto whole=pizza.Boundaries();
    Check(whole.size()==2 && whole[0]==0 && std::abs(whole[1]-6.283185307179586)<1e-10,"whole circle boundary");
    Fraction(pizza.Selected(1),1,1,"select whole pizza");
    Check(!pizza.Selected(0).Valid && !pizza.Selected(2).Valid,"empty and out of range masks invalid");
    Check(pizza.AddDiameter(0),"first diameter accepted");
    Check(pizza.Count()==2 && pizza.EqualParts(),"diameter creates two equal halves");
    Check(!pizza.AddDiameter(180),"opposite diameter is duplicate");
    Fraction(pizza.Selected(1),1,2,"one diameter piece is half");
    Check(pizza.AddDiameter(90),"perpendicular diameter accepted");
    Fraction(pizza.Selected(3),1,2,"two quarters are half");
    Fraction(pizza.Selected(5),1,2,"nonadjacent quarters also form half");
    Check(pizza.AddDiameter(45) && pizza.Count()==6 && !pizza.EqualParts(),"three diameters are interim unequal sixths");
    Check(!pizza.Selected(63).Valid,"interim six piece pizza cannot certify portion");
    Check(pizza.AddDiameter(135) && pizza.Count()==8 && pizza.EqualParts(),"four regular diameters form eighths");
    Fraction(pizza.Selected(127),7,8,"seven eighths are available");
    Fraction(pizza.Selected(255),1,1,"all eighths are whole");
    Check(!pizza.Selected(256).Valid,"out of range eighth mask invalid");
    Check(!pizza.AddDiameter(22.5) && pizza.Count()==8,"cannot add fifth diameter");
    PizzaCuts uneven;
    Check(uneven.AddDiameter(30) && uneven.AddDiameter(90),"free unequal diameters accepted visually");
    const auto angles=uneven.Boundaries();
    Check(angles.size()==5 && std::abs(angles[0]-0.5235987755982988)<1e-10 && std::abs(angles[1]-1.5707963267948966)<1e-10 && std::abs(angles[4]-6.806784082777885)<1e-10,"boundaries retain actual angles with wrapping endpoint");
    Check(!uneven.EqualParts() && !uneven.Selected(1).Valid && !uneven.Selected(15).Valid,"unequal pizza never certifies equal fraction even if whole selected");
    PizzaCuts stroke;
    Check(stroke.AddStroke(-1,0,1,0),"actual central swipe makes diameter");
    Check(!stroke.AddStroke(1,0,-1,0),"reversed swipe duplicate");
    Check(!stroke.AddStroke(-0.2,0,0.2,0),"short swipe rejected");
    Check(!stroke.AddStroke(-1.1,0,1,0),"outside swipe rejected");
    Check(!stroke.AddStroke(-0.9,0.2,0.9,0.2),"noncentral swipe rejected");
    Check(stroke.AddStroke(0.1,-0.9,0.1,0.9),"near center perpendicular swipe accepted");
    Check(stroke.Count()==4 && stroke.EqualParts(),"accepted near center strokes snap to radial diameters");
    Check(!stroke.AddStroke(0,0,std::numeric_limits<double>::infinity(),0),"nonfinite stroke rejected");
    Check(!stroke.AddDiameter(std::numeric_limits<double>::quiet_NaN()),"nonfinite diameter rejected");
    PizzaCuts tolerance;
    Check(tolerance.AddDiameter(-180) && tolerance.AddDiameter(91),"negative angle normalized");
    Check(tolerance.EqualParts(),"one degree deviation meets equal parts tolerance");
    PizzaCuts outsideTolerance;
    outsideTolerance.AddDiameter(0); outsideTolerance.AddDiameter(93);
    Check(!outsideTolerance.EqualParts(),"three degree deviation is unequal");
    PizzaCuts threshold;
    threshold.AddDiameter(0); threshold.AddDiameter(92);
    Check(threshold.EqualParts(),"exact two degree deviation is within tolerance");
    Check(!threshold.AddDiameter(0.5),"near duplicate gesture cannot create thin extra slice");
    const auto portion=MakeLesson(Rational(7,8),Rational(1,2));
    LessonAnswers(portion,{1,8,7},"portion explains whole then denominator then numerator");
    Check(!portion.empty() && portion[0].Prompt.find("7/8")!=std::string::npos && portion[0].Prompt.find("1/2")!=std::string::npos,"portion lesson uses wanted and delivered context");
    LessonAnswers(MakeLesson(Rational(1,2),Rational(1,0)),{1,2,1},"unequal or invalid delivery still receives teaching");
    LessonAnswers(MakeLesson(Rational(3,4),Rational(1,2),'+',Rational(1,2),Rational(1,4)),{4,2,1,3,4},"addition teaches common denominator and both converted numerators");
    LessonAnswers(MakeLesson(Rational(1,4),Rational(3,4),'-',Rational(3,4),Rational(1,2)),{4,3,2,1,4},"subtraction teaches denominator and conversion before result");
    LessonAnswers(MakeLesson(Rational(1,2),Rational(1,4),'*',Rational(2,3),Rational(3,4)),{6,12,1,2},"multiplication teaches products and simplified result");
    LessonAnswers(MakeLesson(Rational(2,3),Rational(1,4),'/',Rational(1,2),Rational(3,4)),{4,3,4,6,2,3},"division teaches reciprocal products and simplified result");
    LessonAnswers(MakeLesson(Rational(1),Rational(1,2),'+',Rational(1,2),Rational(1,2)),{2,1,1,2,1,1},"addition explains raw result before reducing two halves to whole");
    LessonAnswers(MakeLesson(Rational(-1,4),Rational(1,4),'-',Rational(1,4),Rational(1,2)),{4,1,2,-1,4},"subtraction lesson preserves negative result");
    LessonAnswers(MakeLesson(Rational(-2,3),Rational(1,4),'/',Rational(1,2),Rational(-3,4)),{-4,3,-4,6,-2,3},"negative reciprocal keeps positive denominator");
    LessonAnswers(MakeLesson(Rational(1,64),Rational(1,2)),{1,64,1},"choices remain valid at upper small denominator boundary");
    Check(MakeLesson(Rational(1,2),Rational(1,4),'?',Rational(1,2),Rational(1,4)).empty(),"unsupported lesson operation guarded");
    Check(MakeLesson(Rational(1,2),Rational(1,4),'/',Rational(1,2),Rational(0)).empty(),"zero divisor lesson guarded");
    Check(MakeLesson(Rational(1,0),Rational(1,4)).empty(),"invalid target lesson guarded");
    Check(MakeLesson(Rational(3,4),Rational(1,4),'*',Rational(2,3),Rational(3,4)).empty(),"contradictory arithmetic target guarded");
    Check(MakeLesson(Rational(1,128),Rational(1,4)).empty(),"lesson exceeding supported small denominator guarded");
    Check(MakeLesson(Rational(1),Rational(1,4),'*',Rational(64,63),Rational(63,64)).empty(),"large raw multiplication steps are guarded despite small reduced result");
    std::cout << Checks << " checks, " << Failures << " failures\n";
    return Failures ? 1 : 0;
}
