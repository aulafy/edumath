from app.domain.problem import MathSpec
from app.math_engine.arithmetic import solve_math


class ArithmeticVerifier:
    def solve(self, spec: MathSpec) -> int:
        return solve_math(spec)

    def verify(self, spec: MathSpec, candidate: int) -> bool:
        return self.solve(spec) == candidate
