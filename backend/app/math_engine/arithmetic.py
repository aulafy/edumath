from app.domain.problem import MathSpec


def add(a: int, b: int) -> int:
    return a + b


def solve_math(spec: MathSpec) -> int:
    if spec.operation == "add":
        return add(spec.a, spec.b)
    raise ValueError("Unsupported operation")
