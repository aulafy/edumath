from app.domain.problem import MathSpec
from pydantic import BaseModel


class StrategyStep(BaseModel):
    action: str
    value: int


class StrategyEngine:
    def steps(self, strategy: str, spec: MathSpec) -> list[StrategyStep]:
        if strategy == "COUNT_ON":
            return [StrategyStep(action="START_AT", value=spec.a)] + [
                StrategyStep(action="MOVE", value=spec.a + offset)
                for offset in range(1, spec.b + 1)
            ]
        if strategy == "COUNT_ALL":
            return [StrategyStep(action="COUNT", value=i) for i in range(1, spec.answer + 1)]
        if strategy == "NUMBER_BONDS":
            return [
                StrategyStep(action="PART", value=spec.a),
                StrategyStep(action="PART", value=spec.b),
                StrategyStep(action="WHOLE", value=spec.answer),
            ]
        raise ValueError("Unsupported strategy")
