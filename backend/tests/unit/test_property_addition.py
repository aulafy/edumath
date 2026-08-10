from app.domain.problem import MathSpec
from hypothesis import given
from hypothesis import strategies as st


@given(a=st.integers(min_value=0, max_value=10), b=st.integers(min_value=0, max_value=10))
def test_addition_answer_is_sum(a: int, b: int) -> None:
    assert MathSpec(operation="add", a=a, b=b).answer == a + b
