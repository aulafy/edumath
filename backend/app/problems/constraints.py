from pydantic import BaseModel


class AddWithinTenConstraints(BaseModel):
    a_min: int = 1
    a_max: int = 8
    b_min: int = 1
    b_max: int = 8
    result_max: int = 10
    allow_equal_operands: bool = True
    require_non_zero_addend: bool = True
