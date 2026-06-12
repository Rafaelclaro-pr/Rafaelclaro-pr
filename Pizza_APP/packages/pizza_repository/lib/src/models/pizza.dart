import '../entities/entities.dart';
import 'models.dart';

class Pizza {
  final String pizzaId;
  final String picture;
  final bool isVeg;
  final int spicy;
  final String name;
  final String description;
  final int price;
  final int discount;
  final Macros macros;

  const Pizza({
    required this.pizzaId,
    required this.picture,
    required this.isVeg,
    required this.spicy,
    required this.name,
    required this.description,
    required this.price,
    required this.discount,
    required this.macros,
  });

  double get finalPrice => price * (1 - discount / 100);

  Pizza copyWith({
    String? pizzaId,
    String? picture,
    bool? isVeg,
    int? spicy,
    String? name,
    String? description,
    int? price,
    int? discount,
    Macros? macros,
  }) {
    return Pizza(
      pizzaId: pizzaId ?? this.pizzaId,
      picture: picture ?? this.picture,
      isVeg: isVeg ?? this.isVeg,
      spicy: spicy ?? this.spicy,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      discount: discount ?? this.discount,
      macros: macros ?? this.macros,
    );
  }

  PizzaEntity toEntity() {
    return PizzaEntity(
      pizzaId: pizzaId,
      picture: picture,
      isVeg: isVeg,
      spicy: spicy,
      name: name,
      description: description,
      price: price,
      discount: discount,
      macros: macros,
    );
  }

  static Pizza fromEntity(PizzaEntity entity) {
    return Pizza(
      pizzaId: entity.pizzaId,
      picture: entity.picture,
      isVeg: entity.isVeg,
      spicy: entity.spicy,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      discount: entity.discount,
      macros: entity.macros,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Pizza && runtimeType == other.runtimeType && pizzaId == other.pizzaId;

  @override
  int get hashCode => pizzaId.hashCode;

  @override
  String toString() => 'Pizza(id: $pizzaId, name: $name, price: $price)';
}
