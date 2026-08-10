from app.domain.problem import ProblemSpec


class HintPolicy:
    def message(self, problem: ProblemSpec, hint_level: int) -> str:
        if hint_level <= 1:
            return "Prueba a empezar en el primer número y cuenta hacia delante."
        if hint_level == 2:
            return f"Empieza en {problem.math.a}. Da {problem.math.b} saltos pequenos."
        return "Mira el dibujo. Cuenta cada salto o cada objeto una vez."
